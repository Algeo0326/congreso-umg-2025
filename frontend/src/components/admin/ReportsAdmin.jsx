// ============================================================
// 📊 REPORTES DE ASISTENCIA – ADMIN
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../../styles/admin.css";

export default function ReportsAdmin() {
  const [year, setYear] = useState("");
  const [kind, setKind] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ============================================================
  // 📦 FUNCIÓN PARA CARGAR DATOS
  // ============================================================
  async function fetchReport() {
    try {
      setLoading(true);
      const params = [];
      if (year) params.push(`year=${year}`);
      if (kind) params.push(`kind=${kind}`);
      const query = params.length ? `?${params.join("&")}` : "";

      const { data } = await api.get(`api/reports/attendance${query}`);
      setData(data);
      setErr("");
    } catch (error) {
      console.error("❌ Error al cargar reporte:", error);
      setErr("Error al obtener los datos de asistencia.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // Cargar al inicio
  useEffect(() => {
    fetchReport();
  }, []);

  // ============================================================
  // 🎨 COMPONENTE PRINCIPAL
  // ============================================================
  return (
    <div className="admin-body">
      <div className="admin-page">

        {/* 🔙 BOTÓN DE REGRESO */}
        <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <Link
            to="/admin"
            className="btn-return"
            style={{
              display: "inline-block",
              color: "#f5f5f5",
              border: "2px solid #F7D232",
              borderRadius: "10px",
              padding: "0.4rem 1rem",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#F7D232";
              e.target.style.color = "#0a183a";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#f5f5f5";
            }}
          >
            ⬅️ Volver al Panel
          </Link>
        </div>

        <h1 className="admin-title">📊 Reportes de Asistencia</h1>

        {/* 🔹 FILTROS */}
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: "bold" }}>Año:</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Todos</option>
            {Array.from({ length: 6 }, (_, i) => 2020 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <label style={{ marginLeft: "20px", fontWeight: "bold" }}>Tipo:</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Todos</option>
            <option value="TALLER">Taller</option>
            <option value="COMPETENCIA">Competencia</option>
          </select>

          <button
            onClick={fetchReport}
            className="btn-admin blue"
            style={{ marginLeft: "15px" }}
          >
            🔍 Buscar
          </button>

          <button
            onClick={() => {
              setYear("");
              setKind("");
              fetchReport();
            }}
            className="btn-admin gold"
            style={{ marginLeft: "10px" }}
          >
            🔄 Limpiar
          </button>
        </div>

        {/* 🔹 CONTENIDO */}
        {loading ? (
          <p>Cargando reporte...</p>
        ) : err ? (
          <p style={{ color: "red" }}>{err}</p>
        ) : data ? (
          <>
            {/* 🔸 TARJETAS DE RESUMEN */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div className="admin-card" style={{ width: "220px", textAlign: "center" }}>
                <h3>👥 Inscritos</h3>
                <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#5DC3AB" }}>
                  {data.totals.inscritos}
                </p>
              </div>

              <div className="admin-card" style={{ width: "220px", textAlign: "center" }}>
                <h3>✅ Asistieron</h3>
                <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#F7D232" }}>
                  {data.totals.asistieron}
                </p>
              </div>

              <div className="admin-card" style={{ width: "220px", textAlign: "center" }}>
                <h3>📈 Porcentaje</h3>
                <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#42A5F5" }}>
                  {(
                    (Number(data.totals.asistieron || 0) /
                      Number(data.totals.inscritos || 1)) *
                    100
                  ).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 🔸 TABLA DETALLADA */}
            <div className="admin-card">
              <h2 style={{ marginBottom: "1rem" }}>📅 Detalle por Actividad</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Actividad</th>
                    <th>Tipo</th>
                    <th>Inscritos</th>
                    <th>Asistieron</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_activity.map((a) => (
                    <tr key={a.activity_id}>
                      <td>{a.year}</td>
                      <td>{a.title}</td>
                      <td>{a.kind}</td>
                      <td>{a.inscritos}</td>
                      <td>{a.asistieron}</td>
                      <td>
                        {(
                          (Number(a.asistieron || 0) / Number(a.inscritos || 1)) *
                          100
                        ).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>No hay datos de asistencia disponibles.</p>
        )}
      </div>
    </div>
  );
}
