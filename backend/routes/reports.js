// ============================================================
// 📊 REPORTES DE ASISTENCIA
// ============================================================
const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * GET /api/reports/attendance
 * Query params opcionales:
 *  - year: filtra por año de la actividad (columna activities.year)
 *  - kind: 'TALLER' | 'COMPETENCIA'  (enum activities.kind)
 * 
 * Respuesta:
 *  {
 *    totals: { inscritos, asistieron },
 *    by_kind: [ { kind, inscritos, asistieron } ],
 *    by_activity: [ { activity_id, title, kind, year, inscritos, asistieron } ]
 *  }
 */
router.get("/attendance", async (req, res) => {
  const { year, kind } = req.query;

  // Filtros dinámicos seguros
  const filters = [];
  const params = [];

  if (year) {
    filters.push("a.year = ?");
    params.push(year);
  }
  if (kind) {
    filters.push("a.kind = ?");
    params.push(kind);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  // Definición de "asistió"
  // status='ASISTIÓ' OR attended_at IS NOT NULL OR (existe registro en attendance)
  const attendedCase = `
    CASE 
      WHEN r.status = 'ASISTIÓ' 
        OR r.attended_at IS NOT NULL 
        OR att.registration_id IS NOT NULL
      THEN 1 ELSE 0 
    END
  `;

  try {
    // Totales globales
    const [totals] = await pool.query(
      `
      SELECT 
        COUNT(r.id) AS inscritos,
        SUM(${attendedCase}) AS asistieron
      FROM registrations r
      JOIN activities a ON a.id = r.activity_id
      LEFT JOIN attendance att ON att.registration_id = r.id
      ${whereClause}
      `,
      params
    );

    // Totales por tipo (kind)
    const [byKind] = await pool.query(
      `
      SELECT 
        a.kind,
        COUNT(r.id) AS inscritos,
        SUM(${attendedCase}) AS asistieron
      FROM registrations r
      JOIN activities a ON a.id = r.activity_id
      LEFT JOIN attendance att ON att.registration_id = r.id
      ${whereClause}
      GROUP BY a.kind
      ORDER BY a.kind
      `,
      params
    );

    // Detalle por actividad
    const [byActivity] = await pool.query(
      `
      SELECT 
        a.id AS activity_id,
        a.title,
        a.kind,
        a.year,
        COUNT(r.id) AS inscritos,
        SUM(${attendedCase}) AS asistieron
      FROM registrations r
      JOIN activities a ON a.id = r.activity_id
      LEFT JOIN attendance att ON att.registration_id = r.id
      ${whereClause}
      GROUP BY a.id, a.title, a.kind, a.year
      ORDER BY a.year DESC, a.kind, a.title
      `,
      params
    );

    res.json({
      totals: totals?.[0] || { inscritos: 0, asistieron: 0 },
      by_kind: byKind,
      by_activity: byActivity,
    });
  } catch (err) {
    console.error("❌ Error al generar reporte de asistencia:", err);
    res.status(500).json({ message: "Error al generar reporte de asistencia." });
  }
});

module.exports = router;
