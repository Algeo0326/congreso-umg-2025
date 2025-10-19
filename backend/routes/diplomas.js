// ============================================================
// 🎓 RUTAS - MÓDULO DE DIPLOMAS (Automático con PDF y correo)
// ============================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { generateDiploma } = require("../utils/diplomaGenerator");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

// ============================================================
// 📬 CONFIGURACIÓN DEL CLIENTE DE RESEND
// ============================================================
const resend = new Resend(process.env.RESEND_API_KEY);
const MAIL_FROM = process.env.MAIL_FROM || "Congreso UMG <onboarding@resend.dev>";

// ============================================================
// 📩 FUNCIÓN: ENVIAR DIPLOMA POR CORREO (via RESEND)
// ============================================================
async function enviarDiplomaPorCorreo(user, activity, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const pdfBuffer = fs.readFileSync(filePath);

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color:#003366;">🎓 Congreso de Tecnología UMG</h2>
        <p>Hola <b>${user.full_name}</b>,</p>
        <p>Adjuntamos tu diploma de participación en la actividad:</p>
        <p><b>${activity.title}</b></p>
        <p>Puedes conservarlo o imprimirlo desde el archivo PDF adjunto.</p>
        <br>
        <p>Saludos cordiales,<br><b>Equipo del Congreso de Tecnología UMG</b></p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to: user.email,
      subject: `🎓 Diploma de participación – ${activity.title}`,
      html,
      attachments: [
        {
          filename: "Diploma.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    if (error) throw new Error(error.message);

    console.log(`📨 Diploma enviado a ${user.email}`);
    return true;
  } catch (err) {
    console.error("❌ Error enviando correo de diploma:", err.message);
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

    let generados = [];

    for (const row of rows) {
      const [[user]] = await pool.query("SELECT * FROM users WHERE id = ?", [row.user_id]);
      const [[activity]] = await pool.query("SELECT * FROM activities WHERE id = ?", [row.activity_id]);
      if (!user || !activity) continue;

      const dateText = new Date(activity.day).toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // 🎓 Generar PDF
      const { filePath } = await generateDiploma({
        userName: user.full_name,
        activityName: activity.title,
        date: dateText,
        userId: row.user_id,
        activityId: row.activity_id,
      });

      // 📧 Enviar correo
      const enviado = await enviarDiplomaPorCorreo(user, activity, filePath);

      // 💾 Guardar en tabla diplomas
      await pool.query(
        "INSERT INTO diplomas (user_id, activity_id, pdf_file, generated_at, emailed, emailed_at) VALUES (?, ?, ?, NOW(), ?, NOW())",
        [row.user_id, row.activity_id, filePath, enviado ? 1 : 0]
      );

      generados.push({
        user_id: row.user_id,
        activity_id: row.activity_id,
        enviado,
      });
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
// 📧 REENVIAR DIPLOMA POR CORREO (para botón del panel admin)
// ============================================================
router.post("/resend/:id", async (req, res) => {
  try {
    const diplomaId = req.params.id;
    const [rows] = await pool.query(
      `SELECT d.pdf_file, u.full_name, u.email, a.title AS activity_title
       FROM diplomas d
       INNER JOIN users u ON u.id = d.user_id
       INNER JOIN activities a ON a.id = d.activity_id
       WHERE d.id = ?`,
      [diplomaId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "❌ Diploma no encontrado." });
    }

    const diploma = rows[0];
    const pdfBuffer = fs.readFileSync(diploma.pdf_file);

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color:#003366;">🎓 Congreso de Tecnología UMG</h2>
        <p>Hola <b>${diploma.full_name}</b>,</p>
        <p>Te reenviamos tu diploma de participación en la actividad:</p>
        <p><b>${diploma.activity_title}</b></p>
        <p>Adjunto encontrarás tu diploma en formato PDF.</p>
        <br>
        <p>Saludos cordiales,<br><b>Equipo del Congreso de Tecnología UMG</b></p>
      </div>
    `;

    await resend.emails.send({
      from: MAIL_FROM,
      to: diploma.email,
      subject: `🎓 Reenvío de Diploma – ${diploma.activity_title}`,
      html,
      attachments: [
        {
          filename: "Diploma.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    await pool.query(
      "UPDATE diplomas SET emailed = 1, emailed_at = NOW() WHERE id = ?",
      [diplomaId]
    );

    console.log(`📨 Diploma reenviado a ${diploma.email}`);
    res.json({ success: true, message: `✅ Diploma reenviado correctamente a ${diploma.email}.` });
  } catch (error) {
    console.error("❌ Error reenviando diploma:", error);
    res.status(500).json({ message: "Error interno reenviando diploma." });
  }
});

module.exports = router;
