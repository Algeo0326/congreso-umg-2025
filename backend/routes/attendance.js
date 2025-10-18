// ============================================================
// 🧾 RUTA: REGISTRO DE ASISTENCIA + GENERACIÓN AUTOMÁTICA DE DIPLOMA
// ============================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { generateDiploma } = require("../utils/diplomaGenerator"); // 👈 Generador de PDF

router.post("/", async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) return res.status(400).json({ message: "❌ Token no proporcionado." });

    // 🔹 Buscar inscripción con datos de usuario y actividad
    const [registrationRows] = await pool.query(
      `SELECT 
          r.id, r.user_id, r.activity_id, 
          u.full_name, u.email,
          a.title AS activity_title, a.day
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       JOIN activities a ON a.id = r.activity_id
       WHERE r.qr_token = ?`,
      [token]
    );

    if (registrationRows.length === 0) {
      return res.status(404).json({ message: "❌ Token inválido o no encontrado." });
    }

    const reg = registrationRows[0];
    const userId = reg.user_id;
    const activityId = reg.activity_id;

    // 🔹 Marcar asistencia
    await pool.query(
      "UPDATE registrations SET status = 'ASISTIÓ', attended_at = NOW() WHERE qr_token = ?",
      [token]
    );

    // ============================================================
    // 🎓 CREAR DIPLOMA AUTOMÁTICO CON PDF AL CONFIRMAR ASISTENCIA
    // ============================================================
    try {
      const [exists] = await pool.query(
        "SELECT id FROM diplomas WHERE user_id = ? AND activity_id = ?",
        [userId, activityId]
      );

      if (exists.length === 0) {
        const dateText = new Date(reg.day).toLocaleDateString("es-GT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        // 📄 Generar PDF automáticamente
        const { filePath } = await generateDiploma({
          userName: reg.full_name,
          activityName: reg.activity_title,
          date: dateText,
          userId,
          activityId,
        });

        // 💾 Guardar registro en tabla
        await pool.query(
          "INSERT INTO diplomas (user_id, activity_id, pdf_file, generated_at, emailed) VALUES (?, ?, ?, NOW(), 0)",
          [userId, activityId, filePath]
        );

        console.log(`🎓 Diploma generado automáticamente para ${reg.full_name}`);
      }
    } catch (err) {
      console.error("❌ Error generando diploma automático:", err);
    }

    // 🔹 Obtener hora registrada
    const [updatedRows] = await pool.query(
      "SELECT attended_at FROM registrations WHERE qr_token = ?",
      [token]
    );

    const attended_at = updatedRows[0]?.attended_at || new Date();

    res.json({
      message: "✅ Asistencia registrada correctamente.",
      full_name: reg.full_name,
      activity_title: reg.activity_title,
      attended_at,
    });
  } catch (err) {
    console.error("❌ Error general al registrar asistencia:", err);
    res.status(500).json({ message: "❌ Error interno al registrar la asistencia." });
  }
});

module.exports = router;
