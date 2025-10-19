// ============================================================
// 🎓 RUTAS - MÓDULO DE DIPLOMAS (PDF + correo vía Resend)
// ============================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");
const path = require("path");
const fs = require("fs");
const { generateDiploma } = require("../utils/diplomaGenerator");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const MAIL_FROM = process.env.MAIL_FROM || "Congreso UMG <onboarding@resend.dev>";

// ============================================================
// 🕓 FUNCIÓN AUXILIAR: ESPERAR QUE EL ARCHIVO EXISTA
// ============================================================
async function esperarArchivo(filePath, intentos = 10, intervalo = 300) {
  for (let i = 0; i < intentos; i++) {
    if (fs.existsSync(filePath)) return true;
    await new Promise((r) => setTimeout(r, intervalo));
  }
  return false;
}

// ============================================================
// 📩 FUNCIÓN: ENVIAR DIPLOMA POR CORREO (Resend + verificación de archivo)
// ============================================================
async function enviarDiplomaPorCorreo(user, activity, filePath) {
  try {
    // Esperar a que el PDF exista
    const existe = await esperarArchivo(filePath);
    if (!existe) {
      throw new Error(`Archivo no encontrado tras generar: ${filePath}`);
    }

    // Leer PDF
    const pdfBase64 = fs.readFileSync(filePath).toString("base64");

    // Enviar correo
    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to: user.email,
      subject: `🎓 Diploma de participación – ${activity.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f4f6fa;padding:25px;">
          <div style="text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Logo_UMG.png"
                 width="110" height="110"
                 style="border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.2);margin-bottom:10px;"
                 alt="Escudo UMG">
            <h1 style="color:#0a3a82;">Universidad Mariano Gálvez de Guatemala</h1>
            <h2 style="margin-top:-10px;">Congreso de Tecnología UMG 2025</h2>
          </div>

          <div style="background:white;border-radius:12px;padding:25px;
                      box-shadow:0 0 10px rgba(0,0,0,0.1);margin-top:20px;">
            <h3 style="color:#0a3a82;">🎓 Diploma de Participación</h3>
            <p>Hola <b>${user.full_name}</b>,</p>
            <p>Adjuntamos tu diploma de participación en la actividad:</p>
            <p style="text-align:center;"><b>${activity.title}</b></p>
            <p style="text-align:center;">Puedes conservarlo o imprimirlo desde el archivo PDF adjunto.</p>
            <br>
            <p style="text-align:center;">Saludos cordiales,<br>
              <b>Equipo del Congreso de Tecnología UMG</b></p>
          </div>

          <div style="text-align:center;font-size:12px;color:#777;margin-top:20px;">
            <hr style="border:0;border-top:1px solid #ccc;width:60%;margin:15px auto;">
            <p>© ${new Date().getFullYear()} UMG – Todos los derechos reservados.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "Diploma.pdf",
          content: pdfBase64,
          type: "application/pdf",
        },
      ],
    });

    if (error) throw new Error(error.message);
    console.log(`📨 Diploma enviado correctamente a ${user.email}`, data?.id || "(sin ID)");
    return true;
  } catch (err) {
    console.error("❌ Error enviando correo de diploma:", err.message || err);
    return false;
  }
}

// ============================================================
// 🧾 GENERAR Y ENVIAR DIPLOMAS DE TODOS LOS ASISTENTES
// ============================================================
router.post("/generate/all", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.user_id, r.activity_id
      FROM registrations r
      WHERE r.status = 'ASISTIÓ'
        AND NOT EXISTS (
          SELECT 1 FROM diplomas d
          WHERE d.user_id = r.user_id
            AND d.activity_id = r.activity_id
        )
    `);

    if (!rows.length)
      return res.json({ message: "No hay registros pendientes para generar diplomas." });

    const generados = [];

    for (const row of rows) {
      const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [row.user_id]);
      const [activityRows] = await pool.query("SELECT * FROM activities WHERE id = ?", [row.activity_id]);
      if (!userRows.length || !activityRows.length) continue;

      const user = userRows[0];
      const activity = activityRows[0];

      const dateText = activity.day
        ? new Date(activity.day).toLocaleDateString("es-GT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "";

      // 🎓 Generar PDF
      const { filePath } = await generateDiploma({
        userName: user.full_name,
        activityName: activity.title,
        date: dateText,
        userId: row.user_id,
        activityId: row.activity_id,
      });

      // 📧 Enviar por correo
      const enviado = await enviarDiplomaPorCorreo(user, activity, filePath);

      // 💾 Registrar en tabla diplomas
      await pool.query(
        "INSERT INTO diplomas (user_id, activity_id, pdf_file, generated_at, emailed, emailed_at) VALUES (?, ?, ?, NOW(), ?, NOW())",
        [row.user_id, row.activity_id, filePath, enviado ? 1 : 0]
      );

      generados.push({ user_id: row.user_id, activity_id: row.activity_id, enviado });
    }

    res.json({
      success: true,
      message: `🎓 Se generaron y enviaron ${generados.length} diplomas.`,
      details: generados,
    });
  } catch (error) {
    console.error("❌ Error generando diplomas:", error);
    res.status(500).json({ message: "Error interno generando diplomas." });
  }
});

// ============================================================
// 📧 REENVIAR DIPLOMA POR CORREO (panel admin)
// ============================================================
router.post("/resend/:id", async (req, res) => {
  const diplomaId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
         d.id,
         d.pdf_file,
         u.full_name, 
         u.email,
         a.title AS activity_title
       FROM diplomas d
       INNER JOIN users u ON u.id = d.user_id
       INNER JOIN activities a ON a.id = d.activity_id
       WHERE d.id = ?`,
      [diplomaId]
    );

    if (!rows.length) return res.status(404).json({ message: "❌ Diploma no encontrado." });

    const diploma = rows[0];

    const enviado = await enviarDiplomaPorCorreo(
      { full_name: diploma.full_name, email: diploma.email },
      { title: diploma.activity_title },
      diploma.pdf_file
    );

    if (enviado) {
      await pool.query("UPDATE diplomas SET emailed = 1, emailed_at = NOW() WHERE id = ?", [diplomaId]);
      console.log(`📨 Diploma reenviado a ${diploma.email}`);
    }

    res.json({
      success: enviado,
      message: enviado
        ? `✅ Diploma reenviado correctamente a ${diploma.email}.`
        : "❌ No se pudo reenviar el diploma.",
    });
  } catch (error) {
    console.error("❌ Error reenviando diploma:", error);
    res.status(500).json({ message: "Error interno reenviando diploma." });
  }
});

module.exports = router;
