// ============================================================
// 🎟️ INSCRIPCIÓN A ACTIVIDADES (LIMPIO CON CLASES CSS)
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { QRCodeCanvas } from "qrcode.react";

export default function Registration({ initialUserId }) {
  const [userId, setUserId] = useState(initialUserId || "");
  const [activities, setActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/activities");
        setActivities(data);
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      }
    })();
  }, []);

  const handleCheckboxChange = (activityId) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      await api.post("/api/registrations", {
        user_id: Number(userId),
        activity_ids: selectedActivities.map(Number),
      });
      setMsg("✅ Inscripciones completadas con éxito.");
      setTimeout(() => navigate("/gracias"), 3500);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      {/* Panel izquierdo */}
      <div className="registration-left">
        <h2>🎟️ Inscripción a Actividades</h2>
        <p>
          Ingresa tu <strong>ID de Usuario</strong> y selecciona todas las
          actividades en las que desees participar. <br />
          Recibirás un correo individual con tu QR por cada actividad.
        </p>
        <img
          src="https://cdn-icons-png.flaticon.com/512/1006/1006555.png"
          alt="Registro"
          className="registration-icon"
        />
      </div>

      {/* Panel derecho */}
      <div className="registration-right">
        <form onSubmit={submit}>
          <label htmlFor="userId" className="form-label">
            ID de Usuario
          </label>
          <input
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="Ej. 15"
            className="form-input"
          />

          <label className="form-label">Selecciona las actividades:</label>
          <div className="activities-box">
            {activities.map((a) => (
              <div
                key={a.id}
                className={`activity-item ${
                  selectedActivities.includes(a.id.toString())
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  id={`activity-${a.id}`}
                  checked={selectedActivities.includes(a.id.toString())}
                  onChange={() => handleCheckboxChange(a.id.toString())}
                />
                <label htmlFor={`activity-${a.id}`}>
                  <strong>{a.title}</strong> <br />
                  📅 {a.day ? new Date(a.day).toLocaleDateString() : "Sin fecha"}{" "}
                  🕒 {a.hour ? a.hour.slice(0, 5) : "Sin hora"} <br />
                  📍 {a.location || "Sin ubicación"}
                </label>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || selectedActivities.length === 0}
          >
            {loading ? "Procesando..." : "Inscribirse"}
          </button>
        </form>

        {msg && <p className="msg-success">{msg}</p>}
        {err && <p className="msg-error">{err}</p>}
      </div>
    </div>
  );
}
