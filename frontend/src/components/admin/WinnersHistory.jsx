import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/admin.css";

export default function WinnersHistory() {
  const [records, setRecords] = useState([]);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchHistory(); // carga inicial
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/winners/history${year ? `?year=${year}` : ""}`
      );
      setRecords(data);
      setErr("");
    } catch (error) {
      console.error("❌ Error al cargar histórico:", error);
      setErr("Error al obtener el histórico de ganadores.");
    } finally {
      setLoading(false);
    }
  }

  function getMedalIcon(position) {
    const num = parseInt(position);
    switch (num) {
      case 1:
        return (
          <span style={{ color: "#d4af37", fontWeight: "bold" }}>🥇 1° Lugar</span>
        );
      case 2:
        return (
          <span style={{ color: "#C0C0C0", fontWeight: "bold" }}>🥈 2° Lugar</span>
        );
      case 3:
        return (
          <span style={{ color: "#cd7f32", fontWeight: "bold" }}>🥉 3° Lugar</span>
        );
      default:
        return num ? `${num}° Lugar` : "-";
    }
  }

  return (
    <div className="admin-body">
      <div className="admin-page">
              {/* 🔹 Botón Volver al Panel */}
<div className="back-button-container">
  <Link to="/admin" className="btn-back-panel">
    ⬅️ Volver al Panel
  </Link>
</div>
        <h1 className="admin-title">📚 Histórico de Ganadores</h1>

 


        {/* 🔹 Filtro por año */}
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="yearFilter" style={{ fontWeight: "bold" }}>
            Filtrar por año:
          </label>
          <input
            id="yearFilter"
            type="number"
            min="2020"
            max={new Date().getFullYear()}
            placeholder="Ej. 2025"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              width: "100px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => fetchHistory()}
            className="btn-admin blue"
            style={{ marginLeft: "15px" }}
          >
            🔍 Buscar
          </button>
          <button
            onClick={() => {
              setYear("");
              fetchHistory();
            }}
            className="btn-admin gold"
            style={{ marginLeft: "10px" }}
          >
            🔄 Limpiar filtro
          </button>
        </div>

        {/* 🔹 Contenido de la tabla */}
        {loading ? (
          <p>Cargando histórico...</p>
        ) : err ? (
          <p style={{ color: "red" }}>{err}</p>
        ) : records.length === 0 ? (
          <p>No hay registros en el histórico.</p>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Puesto</th>
                  <th>Año</th>
                  <th>Actividad</th>
                  <th>Ganador</th>
                  <th>Correo</th>
                  <th>Fecha Publicación</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{getMedalIcon(r.position)}</td>
                    <td>{r.publication_year}</td>
                    <td>{r.activity_name}</td>
                    <td>{r.full_name}</td>
                    <td>{r.email}</td>
                    <td>
                      {new Date(r.publication_date).toLocaleDateString("es-GT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
