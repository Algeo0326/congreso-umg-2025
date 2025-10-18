// ============================================================
// 📦 RUTA DE INSCRIPCIONES (MÚLTIPLES ACTIVIDADES)
// ============================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const { sendConfirmationEmail } = require("../utils/mailer");

// ============================================================
// 🧩 INSCRIPCIÓN MÚLTIPLE (una o varias actividades)
// ============================================================

router.post("/", async (req, res) => {
  let {
    user_id,
    full_name,
    email,
    phone,
    type,
    activity_id,
    activity_ids,
    school,
    university_id,
  } = req.body;

  const FRONTEND_BASE_URL =
    process.env.FRONTEND_BASE_URL || "http://localhost:3000";
  const makeQrLink = (token) =>
    `${FRONTEND_BASE_URL}/#/asistencia?token=${encodeURIComponent(token)}`;

  try {
    // Normalizar tipo
    if (type === "EXTERNAL") type = "EXTERNO";
    if (type === "INTERNAL") type = "INTERNO";
    if (type === "ADMINISTRATOR") type = "ADMIN";
    if (!["EXTERNO", "INTERNO", "ADMIN"].includes(type)) type = "EXTERNO";

    // Determinar actividades
    const activitiesToRegister =
      Array.isArray(activity_ids) && activity_ids.length > 0
        ? activity_ids
        : activity_id
        ? [activity_id]
        : [];

    if (activitiesToRegister.length === 0) {
      return res
        .status(400)
        .json({ message: "⚠️ Debes seleccionar al menos una actividad." });
    }

    // Buscar o crear usuario
    let userRecord;
    if (user_id) {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
        user_id,
      ]);
      if (rows.length === 0)
        return res.status(404).json({ message: "⚠️ Usuario no encontrado." });
      userRecord = rows[0];
    } else {
      const [existingByEmail] = await pool.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email]
      );
      if (existingByEmail.length > 0) {
        userRecord = existingByEmail[0];
      } else {
        const [newUser] = await pool.query(
          `INSERT INTO users (full_name, email, phone, type, school, university_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [full_name, email, phone || null, type, school || null, university_id || null]
        );
        userRecord = { id: newUser.insertId, full_name, email };
      }
    }

    // Procesar inscripciones
    const successful = [];
    const skipped = [];

    for (const actId of activitiesToRegister) {
      const [already] = await pool.query(
        "SELECT id FROM registrations WHERE user_id = ? AND activity_id = ? LIMIT 1",
        [userRecord.id, actId]
      );

      if (already.length > 0) {
        skipped.push(actId);
        continue;
      }

      const qrToken = uuidv4();

      await pool.query(
        "INSERT INTO registrations (user_id, activity_id, qr_token, status, created_at) VALUES (?, ?, ?, 'INSCRITO', NOW())",
        [userRecord.id, actId, qrToken]
      );

      const [activityInfo] = await pool.query(
        "SELECT id, title, day, hour, location FROM activities WHERE id = ?",
        [actId]
      );

      if (activityInfo.length > 0) {
        const qrLink = makeQrLink(qrToken);
        await sendConfirmationEmail(
          userRecord.email,
          userRecord.full_name,
          activityInfo[0],
          qrLink
        );

        successful.push({
          activity_id: actId,
          title: activityInfo[0].title,
          qr_token: qrToken,
        });
      }
    }

    res.json({
      message: "✅ Inscripciones procesadas correctamente.",
      user_id: userRecord.id,
      successful,
      skipped,
    });
  } catch (err) {
    console.error("❌ Error en inscripción múltiple:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
