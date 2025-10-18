// ============================================================
// 🎓 PÁGINA PRINCIPAL - CONGRESO DE TECNOLOGÍA UMG 2025
// ============================================================

import { useEffect, useState, useRef } from "react";
import api from "../api";
import umgLogo from "../assets/umg-logo.png";
import "../styles.css";
import { Link } from "react-router-dom";
import WinnersSection from "../components/WinnersSection"; // 🏆 Nueva sección de ganadores

export default function HomePage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 🔽 Control del dropdown (idéntico al del Navbar)
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

  // 🔹 Cerrar cualquier dropdown al hacer clic fuera
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
    <div className="homepage">
      <div className="overlay">
        {/* ====== ENCABEZADO ====== */}
        <div className="home-content">
          <img src={umgLogo} alt="UMG Logo" className="umg-logo" />
          <h1>🎓 Congreso de Tecnología UMG 2025</h1>
          <p className="subtitle">
            Bienvenido al sistema oficial de inscripción y gestión de actividades
            del Congreso de Tecnología.
          </p>
          <p className="subtitle">
            Regístrate según tu tipo de usuario y participa en los eventos programados.
          </p>
        </div>

        {/* ====== ACTIVIDADES ====== */}
        <div className="activity-list">
          <h2 className="header-gold">🗓️ Actividades Disponibles</h2>
          {loading && <p>Cargando actividades...</p>}
          {err && <p className="msg-error">Error: {err}</p>}
          {!loading && !err && activities.length === 0 && (
            <p>No hay actividades aún.</p>
          )}

          {!loading && !err && activities.length > 0 && (
            <div className="activity-grid">
              {activities.map((a) => (
                <div className="activity-card" key={a.id}>
                  <h3>{a.title}</h3>
                  <p>
                    🏷️ <strong>{a.kind}</strong>
                  </p>
                  <p>📍 {a.location || "Sin lugar"}</p>
                  <p>📅 {formatDate(a.day)}</p>
                  <p>⏰ {formatHour(a.hour)}</p>

                  {/* 🔽 Botón idéntico al del Navbar */}
                  <div
                    className="dropdown"
                    ref={(el) => (dropdownRefs.current[a.id] = el)}
                  >
                    <button
                      className="dropbtn"
                      onClick={() => toggleDropdown(a.id)}
                    >
                      Inscripción ▾
                    </button>
                    <div
                      className={`dropdown-content ${
                        dropdownOpenId === a.id ? "show" : ""
                      }`}
                    >
                      <Link to="/externos">Soy Alumno Externo</Link>
                      <Link to="/internos">Soy Alumno Interno</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====== 🏆 SECCIÓN DE GANADORES ====== */}
        <WinnersSection />
      </div>
    </div>
  );
}
