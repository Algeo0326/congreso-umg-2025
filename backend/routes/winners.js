// ============================================================
// 🏆 RUTAS DE GANADORES (Competencias)
// ============================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");

// ============================================================
// 📋 LISTAR GANADORES OFICIALES (público)
// ============================================================
router.get("/list", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        w.id, 
        w.name, 
        w.project_title, 
        w.description, 
        w.photo_url,
        w.position, 
        w.year,
        a.title AS activity_title, 
        a.kind AS activity_type
      FROM winners w
      LEFT JOIN activities a ON w.activity_id = a.id
      ORDER BY w.year DESC, w.position ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener ganadores:", err);
    res.status(500).json({ message: "Error al obtener ganadores." });
  }
});

// ============================================================
// 🧩 LISTAR CANDIDATOS A GANADOR (ADMIN)
// ============================================================
router.get("/candidates", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id AS user_id,
        u.full_name AS name,
        u.email,
        u.phone,
        u.school,
        a.id AS activity_id,
        a.title AS activity_title,
        a.kind AS activity_type,
        a.year,
        r.status AS registration_status,
        d.pdf_file AS diploma_file,
        d.generated_at AS diploma_generated
      FROM registrations r
      INNER JOIN users u ON u.id = r.user_id
      INNER JOIN activities a ON a.id = r.activity_id
      LEFT JOIN diplomas d 
        ON d.user_id = u.id AND d.activity_id = a.id
      ORDER BY a.year DESC, a.title, u.full_name
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener candidatos:", err);
    res.status(500).json({ message: "Error al obtener candidatos a ganador." });
  }
});

// ============================================================
// ➕ CREAR NUEVO GANADOR (ADMIN aprueba)
// ============================================================
router.post("/create", async (req, res) => {
  const { activity_id, name, project_title, description, photo_url, position, year } = req.body;

  try {
    // 🔹 1. Obtener automáticamente el título y tipo de la actividad
    const [act] = await pool.query(
      "SELECT title, kind FROM activities WHERE id = ?",
      [activity_id]
    );

    const activity_title = act[0]?.title || "Actividad no especificada";
    const activity_type = act[0]?.kind || "Otro";

    // 🔹 2. Guardar el registro con datos completos
    const [result] = await pool.query(
      `
      INSERT INTO winners 
        (activity_id, name, project_title, description, photo_url, position, year, activity_title, activity_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        activity_id,
        name,
        project_title,
        description,
        photo_url,
        position,
        year,
        activity_title,
        activity_type,
      ]
    );

    res.json({
      message: "🏅 Ganador registrado exitosamente.",
      id: result.insertId,
      activity_title,
    });
  } catch (err) {
    console.error("❌ Error al registrar ganador:", err);
    res.status(500).json({ message: "Error al registrar ganador." });
  }
});

// ============================================================
// 🗑️ ELIMINAR GANADOR
// ============================================================
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM winners WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      res.json({ message: "🗑️ Ganador eliminado correctamente." });
    } else {
      res.status(404).json({ message: "Ganador no encontrado." });
    }
  } catch (err) {
    console.error("❌ Error al eliminar ganador:", err);
    res.status(500).json({ message: "Error al eliminar ganador." });
  }
});

// ============================================================
// 🗓️ PUBLICAR GANADORES OFICIALMENTE (Registrar en histórico)
// ============================================================
router.post("/publish", async (req, res) => {
  const { activity_id } = req.body;

  try {
    // 1️⃣ Obtener ganadores de esa actividad
    const [winners] = await pool.query(
      "SELECT * FROM winners WHERE activity_id = ?",
      [activity_id]
    );

    if (winners.length === 0) {
      return res.status(404).json({
        message: "⚠️ No hay ganadores registrados para esta actividad.",
      });
    }

    // 2️⃣ Insertar en histórico
    let inserted = 0;

    for (const w of winners) {
      // Buscar usuario vinculado
      const [user] = await pool.query(
        "SELECT id FROM users WHERE full_name = ? OR email = ? LIMIT 1",
        [w.name, w.description] // description puede tener email
      );

      if (user.length > 0) {
        await pool.query(
          `
          INSERT INTO winners_history (winner_id, activity_id, publication_date)
          SELECT ?, ?, NOW()
          WHERE NOT EXISTS (
            SELECT 1 FROM winners_history 
            WHERE winner_id = ? AND activity_id = ?
          )
        `,
          [user[0].id, activity_id, user[0].id, activity_id]
        );
        inserted++;
      } else {
        console.warn(`⚠️ No se encontró usuario vinculado a: ${w.name}`);
      }
    }

    // 3️⃣ Actualizar fecha de publicación
    await pool.query("UPDATE activities SET end_at = NOW() WHERE id = ?", [
      activity_id,
    ]);

    res.json({
      message: "✅ Ganadores publicados y registrados en el histórico correctamente.",
      inserted,
    });
  } catch (err) {
    console.error("❌ Error al publicar ganadores:", err);
    res.status(500).json({ message: "Error al publicar ganadores." });
  }
});

// ============================================================
// 📚 HISTÓRICO DE GANADORES (ADMIN)
// ============================================================
router.get("/history", async (req, res) => {
  const { year } = req.query;

  try {
    const isValidYear = year && !isNaN(parseInt(year));

    const query = `
      SELECT 
        h.id,
        h.publication_date,
        h.publication_year,
        a.title AS activity_name,
        u.full_name,
        u.email,
        w.position
      FROM winners_history h
      JOIN users u ON u.id = h.winner_id
      JOIN activities a ON a.id = h.activity_id
      LEFT JOIN winners w ON w.activity_id = h.activity_id AND w.name = u.full_name
      ${isValidYear ? "WHERE h.publication_year = ?" : ""}
      ORDER BY h.publication_year DESC, w.position ASC
    `;

    const [rows] = await pool.query(query, isValidYear ? [year] : []);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener histórico:", err);
    res
      .status(500)
      .json({ message: "Error al obtener histórico de ganadores." });
  }
});

module.exports = router;
