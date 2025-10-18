import { useEffect, useState } from "react";
import api from "../api";
import "../styles.css"; // ✅ importa el global styles.css

export default function ActivityCards() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/activities");
        setActivities(data);
      } catch (e) {
        setError("Error al cargar actividades");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando actividades...</p>;
  if (error) return <p className="msg-error">{error}</p>;

  return (
    <div className="activity-section">
      <h2 className="header-gold">📅 Actividades Disponibles</h2>
      <div className="activity-container">
        {activities.map((a) => (
          <div key={a.id} className="activity-horizontal-card">
            <h3>{a.title}</h3>
            <p>📘 <strong>{a.kind}</strong></p>
            <p>📍 {a.location || "Sin lugar"}</p>
            <p>📅 {a.day ? new Date(a.day).toLocaleDateString() : "Sin fecha"}</p>
            <p>⏰ {a.hour ? a.hour.slice(0, 5) : "Sin hora"}</p>
            <button className="btn-register">Inscribirse</button>
          </div>
        ))}
      </div>
    </div>
  );
}
