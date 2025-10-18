// ============================================================
// 📅 LISTADO DE ACTIVIDADES – INSCRIPCIONES
// (Versión alineada con HomePage)
// ============================================================

import { useEffect, useState, useRef } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import "../styles.css";

export default function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/activities");
        setActivities(data);
      } catch (e) {
        setErr(e.message || "Error cargando actividades");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = Object.values(dropdownRefs.current);
      if (refs.every((ref) => ref && !ref.contains(event.target))) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("es-GT", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "Sin fecha";

  const formatHour = (h) => (h ? h.slice(0, 5) : "Sin hora");

  return (
    <div className="activity-list">
      <h2 className="header-gold">🗓️ Actividades Disponibles</h2>

      {loading && <p>Cargando actividades…</p>}
      {err && <p className="msg-error">Error: {err}</p>}
      {!loading && !err && activities.length === 0 && (
        <p>No hay actividades aún.</p>
      )}

      {!loading && !err && activities.length > 0 && (
        <div className="activity-grid">
          {activities.map((a) => (
            <div className="activity-card" key={a.id}>
              <h3>{a.title}</h3>
              <p>🏷️ <strong>{a.kind}</strong></p>
              <p>📍 {a.location ?? "Sin ubicación"}</p>
              <p>📅 {formatDate(a.day)}</p>
              <p>⏰ {formatHour(a.hour)}</p>

              {/* 🔽 Botón de inscripción con dropdown */}
              <div
                className="dropdown"
                ref={(el) => (dropdownRefs.current[a.id] = el)}
              >
              
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
