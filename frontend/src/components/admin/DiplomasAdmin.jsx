import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../styles/admin.css";

export default function DiplomasAdmin() {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDiplomas();
  }, []);

  async function fetchDiplomas() {
    try {
      setLoading(true);
      const res = await API.get("/api/diplomas/list-all");
      setDiplomas(res.data || []);
    } catch (err) {
      console.error("Error cargando diplomas:", err);
      setMessage("❌ No se pudieron cargar los diplomas.");
    } finally {
      setLoading(false);
    }
  }

  // ✉️ Enviar diplomas individuales o todos los pendientes
  async function handleSend(type, diplomaId) {
    setLoading(true);
    setMessage("");
    try {
      let res;
      if (type === "single") {
        res = await API.post(`/api/diplomas/resend/${diplomaId}`);
      } else {
        res = await API.post("/api/diplomas/send-all");
      }

      setMessage(res.data.message || "✅ Envío completado correctamente.");
      fetchDiplomas();
    } catch (err) {
      console.error("Error enviando diplomas:", err);
      setMessage("❌ Error al enviar los diplomas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-body">
      <div className="admin-page">
        {/* 🔙 Botón de regreso */}
        <div className="back-btn-container" style={{ textAlign: "left", marginBottom: "1rem" }}>
          <button className="btn-transparent" onClick={() => navigate("/admin")}>
            <span style={{ marginRight: "6px" }}>⬅️</span> Volver al Panel
          </button>
        </div>

        <h1 className="admin-title">🎓 Administración de Diplomas</h1>

        {message && (
          <div
            className="message-box"
            style={{
              background: "#0a183a",
              border: "1px solid #F7D232",
              color: "#f5f5f5",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {message}
          </div>
        )}
        {loading && <p className="loading-text">⏳ Procesando...</p>}

        {/* 🧾 Tabla de diplomas */}
        <div className="admin-card">
          <div className="table-container">
            <table className="diplomas-table">
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "23%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Actividad</th>
                  <th>Fecha generado</th>
                  <th>Enviado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {diplomas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No hay diplomas generados.
                    </td>
                  </tr>
                ) : (
                  diplomas.map((d, i) => (
                    <tr
                      key={d.id}
                      style={{
                        background: i % 2 === 0 ? "#132a5a" : "#0f2047",
                        color: "#fff",
                      }}
                    >
                      <td>{d.id}</td>
                      <td>{d.full_name}</td>
                      <td>{d.email}</td>
                      <td>{d.activity_title}</td>
                      <td>{d.generated_at ? d.generated_at.split("T")[0] : "-"}</td>
                      <td>{d.emailed ? "✅" : "❌"}</td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                          <button
                            onClick={() => handleSend("single", d.id)}
                            className="btn-table blue"
                          >
                            Enviar
                          </button>
                          <button
                            onClick={() => handleSend("single", d.id)}
                            className="btn-table gold"
                          >
                            Reenviar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 📤 Botón principal */}
          <div className="center-btn" style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={() => handleSend("all")}
              className="btn-admin green"
              style={{ fontWeight: "bold", fontSize: "1rem", padding: "10px 25px" }}
            >
              📤 Enviar todos los diplomas pendientes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
