// ============================================================
// 🏆 SECCIÓN DE GANADORES - CARNET VERTICAL ESTILO CREDENCIAL
// ============================================================

import { useEffect, useState } from "react";
import api from "../api";
import "../styles.css";

export default function WinnersSection() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/winners/list");
        setWinners(data);
      } catch (err) {
        console.error("❌ Error cargando ganadores:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center" }}>Cargando ganadores...</p>;

  if (winners.length === 0)
    return (
      <div className="winners-section">
        <h2 className="header-gold">🏆 Ganadores del Congreso</h2>
        <p style={{ textAlign: "center" }}>Aún no se han publicado ganadores.</p>
      </div>
    );

  return (
    <div className="winners-section">
      <h2 className="header-gold">🏆 Ganadores del Congreso</h2>

      <div className="winners-grid">
        {winners.map((w, i) => (
          <div
            key={w.id}
            className="winner-card-vertical"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="lanyard"></div>
            <div className="photo-frame">
              <img
                src={w.photo_url || "/img/default.png"}
                alt={w.name}
                onError={(e) => (e.target.src = "/img/default.png")}
              />
            </div>

            <div className="winner-info-v">
              <h3>{w.name}</h3>
              <h4>{w.activity_title || w.project_title}</h4>
              <p>{w.description}</p>

              <span
                className={`winner-medal ${
                  w.position === 1
                    ? "gold"
                    : w.position === 2
                    ? "silver"
                    : "bronze"
                }`}
              >
                {w.position === 1
                  ? "🥇 Primer Lugar"
                  : w.position === 2
                  ? "🥈 Segundo Lugar"
                  : "🥉 Tercer Lugar"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
