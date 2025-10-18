// ============================================================
// 🏆 ADMINISTRACIÓN DE GANADORES (Versión Final con inserción automática al histórico)
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../../styles/admin.css";

export default function WinnersAdmin() {
  const [activities, setActivities] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [positions, setPositions] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState([]);
  const [inscritosCount, setInscritosCount] = useState(0);
  const [descriptions, setDescriptions] = useState({});
  const [photos, setPhotos] = useState({});

  // ============================================================
  // 📦 CARGAR DATOS INICIALES
  // ============================================================
  useEffect(() => {
    (async () => {
      try {
        const { data: acts } = await api.get("/api/activities");
        setActivities(acts);
        const { data: cand } = await api.get("/api/winners/candidates");
        setCandidates(cand);
        const { data: wins } = await api.get("/api/winners/list");
        const publishedIds = [...new Set(wins.map((w) => w.activity_id))];
        setPublished(publishedIds);
      } catch (err) {
        console.error(err);
        setMsg("❌ Error al cargar información inicial.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ============================================================
  // 🎯 FILTRAR POR ACTIVIDAD SELECCIONADA
  // ============================================================
  useEffect(() => {
    if (selectedActivity) {
      const results = candidates.filter(
        (c) => c.activity_id === Number(selectedActivity)
      );
      setFiltered(results);
      setInscritosCount(results.length);
      setMsg(results.length === 0 ? "⚠️ No hay inscritos en esta actividad." : "");
    } else {
      setFiltered([]);
      setInscritosCount(0);
      setMsg("");
    }
  }, [selectedActivity, candidates]);

  // ============================================================
  // 🏁 PUBLICAR GANADORES (con inserción automática al histórico)
  // ============================================================
  const updatePosition = (userId, pos) => {
    setPositions((prev) => ({
      ...prev,
      [userId]: pos,
    }));
  };

  const handlePublish = async () => {
    const selectedWinners = filtered.filter((c) => positions[c.user_id]);
    if (selectedWinners.length === 0) {
      setMsg("⚠️ No has asignado posiciones.");
      return;
    }

    try {
      // 1️⃣ Registrar ganadores
      for (const w of selectedWinners) {
        const payload = {
          activity_id: w.activity_id,
          name: w.name,
          project_title: w.project_title || "Proyecto no especificado",
          description: descriptions[w.user_id] || w.email || "Sin descripción del proyecto",
          photo_url: photos[w.user_id] || "",
          position: positions[w.user_id],
          year: w.year,
        };
        await api.post("/api/winners/create", payload);
      }

      // 2️⃣ Registrar automáticamente en el histórico
      const activityId = selectedWinners[0].activity_id;
      await api.post("/api/winners/publish", { activity_id: activityId });

      // 3️⃣ Mensaje final y limpieza
      setMsg("✅ Ganadores publicados y registrados en el histórico correctamente.");
      setPositions({});
      setSelectedActivity("");
      setDescriptions({});
      setPhotos({});
    } catch (err) {
      console.error(err);
      setMsg("❌ Error al publicar o registrar los ganadores.");
    }
  };

  // ============================================================
  // 🎨 COLOR DEL SELECTOR SEGÚN INSCRITOS
  // ============================================================
  const borderColor =
    inscritosCount === 0 && selectedActivity
      ? "#F7D232"
      : inscritosCount > 0
      ? "#5DC3AB"
      : "#F7D232";

  // ============================================================
  // 🖼️ INTERFAZ PRINCIPAL
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

        <h1 className="admin-title">🏆 Gestión de Ganadores por Actividad</h1>

        {/* 🔽 SELECTOR DE ACTIVIDAD */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <label>
            <strong>Selecciona una actividad:</strong>{" "}
          </label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            style={{
              padding: "0.5rem 0.8rem",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#0a183a",
              color: "#f5f5f5",
              border: `2px solid ${borderColor}`,
              fontWeight: "500",
              fontSize: "0.95rem",
              transition: "border 0.3s ease",
            }}
          >
            <option value="">-- Elegir --</option>
            {activities.map((a) => {
              const inscritos = candidates.filter(
                (c) => c.activity_id === Number(a.id)
              ).length;
              const tooltip =
                inscritos === 0
                  ? "⚠️ No hay inscritos en esta actividad."
                  : `👥 ${inscritos} inscrito${inscritos > 1 ? "s" : ""}`;
              const icon = inscritos === 0 ? "⚠️" : "👥";
              return (
                <option
                  key={a.id}
                  value={a.id}
                  title={tooltip}
                  style={{
                    color: inscritos === 0 ? "#F7D232" : "#5DC3AB",
                    background: "#112b5f",
                    fontWeight: "bold",
                  }}
                >
                  {a.title} ({a.year}){" "}
                  {a.kind === "COMPETENCIA" ? "🏁" : ""} — {icon} {inscritos}
                </option>
              );
            })}
          </select>
        </div>

        {/* ⚠️ MENSAJE GLOBAL */}
        {msg && (
          <p
            style={{
              textAlign: "center",
              color: msg.includes("❌") ? "red" : "white",
              marginBottom: "1rem",
            }}
          >
            {msg}
          </p>
        )}

        {loading && <p>Cargando información...</p>}

        {/* 🔹 TABLA DE PARTICIPANTES */}
        {!loading && selectedActivity && (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Escuela</th>
                  <th>Correo</th>
                  <th>Descripción Proyecto</th>
                  <th>Foto</th>
                  <th>Posición</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.user_id}>
                    <td>{c.name}</td>
                    <td>{c.school || "-"}</td>
                    <td>{c.email}</td>

                    {/* 📝 Descripción */}
                    <td>
                      <textarea
                        placeholder="Descripción del proyecto"
                        value={descriptions[c.user_id] || ""}
                        onChange={(e) =>
                          setDescriptions({
                            ...descriptions,
                            [c.user_id]: e.target.value,
                          })
                        }
                        rows={2}
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.05)",
                          color: "white",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          resize: "none",
                        }}
                      ></textarea>
                    </td>

                    {/* 📸 Foto */}
                    <td>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setPhotos({
                                ...photos,
                                [c.user_id]: ev.target.result,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.05)",
                          color: "white",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "4px",
                        }}
                      />

                      {photos[c.user_id] && (
                        <img
                          src={photos[c.user_id]}
                          alt="preview"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            marginTop: "6px",
                            objectFit: "cover",
                            border: "2px solid #F7D232",
                          }}
                        />
                      )}
                    </td>

                    <td>
                      <select
                        value={positions[c.user_id] || ""}
                        onChange={(e) => updatePosition(c.user_id, e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="1">🥇 1°</option>
                        <option value="2">🥈 2°</option>
                        <option value="3">🥉 3°</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <button className="btn-admin purple" onClick={handlePublish}>
                  📢 Publicar Resultados
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
