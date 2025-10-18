//ActivityManager.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import "../../styles/admin.css";

export default function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    title: "",
    kind: "",
    location: "",
    day: "",
    hour: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/activities");
      setActivities(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/api/activities/${form.id}`, form);
      } else {
        await api.post("/api/activities", form);
      }

      setForm({ id: null, title: "", kind: "", location: "", day: "", hour: "" });
      setIsEditing(false);
      fetchActivities();
    } catch (e) {
      alert("Error al guardar: " + (e.response?.data?.error || e.message));
    }
  };

  const handleEdit = (a) => {
    setForm({
      id: a.id,
      title: a.title,
      kind: a.kind,
      location: a.location || "",
      day: a.day ? a.day.slice(0, 10) : "",
      hour: a.hour || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta actividad?")) return;
    try {
      await api.delete(`/api/activities/${id}`);
      fetchActivities();
    } catch (e) {
      alert("Error al eliminar: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="admin-body">
      <div className="admin-page">
        {/* 🔙 Botón de retroceso */}
        <Link to="/admin" className="btn-back">
          ⬅️ Volver al Panel
        </Link>

        <h2 className="admin-title">📅 Gestión de Actividades</h2>

        {/* 🧾 Formulario compacto */}
        <div className="admin-card">
          <form onSubmit={handleSubmit} className="admin-controls">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Título"
              required
            />

            <select
              name="kind"
              value={form.kind}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tipo</option>
              <option value="TALLER">Taller</option>
              <option value="COMPETENCIA">Competencia</option>
            </select>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Lugar"
            />

            <input
              type="date"
              name="day"
              value={form.day}
              onChange={handleChange}
            />

            <input
              type="time"
              name="hour"
              value={form.hour}
              onChange={handleChange}
            />

            <button type="submit">
              {isEditing ? "💾 Actualizar" : "➕ Agregar"}
            </button>
          </form>
        </div>

        {/* 📋 Tabla de actividades */}
        <div className="admin-card">
          {loading && <p>Cargando actividades...</p>}
          {error && <p className="msg-error">Error: {error}</p>}

          {!loading && !error && activities.length === 0 && (
            <p>No hay actividades registradas aún.</p>
          )}

          {!loading && !error && activities.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Lugar</th>
                  <th>Día</th>
                  <th>Hora</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.title}</td>
                    <td>{a.kind}</td>
                    <td>{a.location ?? "—"}</td>
                    <td>{a.day ? new Date(a.day).toLocaleDateString() : "—"}</td>
                    <td>{a.hour ? a.hour.slice(0, 5) : "—"}</td>
                    <td className="actions">
  <button
    onClick={() => handleEdit(a)}
    className="icon-btn edit-btn"
    title="Editar"
  >
    ✏️
  </button>
  <button
    onClick={() => handleDelete(a.id)}
    className="icon-btn delete-btn"
    title="Eliminar"
  >
    🗑️
  </button>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
