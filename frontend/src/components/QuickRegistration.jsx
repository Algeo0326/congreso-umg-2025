import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import "../styles.css";

export default function QuickRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    type: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState("");

  // 🔹 Cargar información de la actividad
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/activities/${id}`);
        setActivity(data);
      } catch (err) {
        console.error(err);
        setMessage("Error al cargar la actividad seleccionada.");
      }
    })();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const email = form.email.trim().toLowerCase();

    // 🧠 Validación de dominio según tipo
    if (form.type === "INTERNO" && !email.endsWith("@miumg.edu.gt")) {
      setMessage(
        "⚠️ Los alumnos internos deben usar su correo institucional (@miumg.edu.gt)."
      );
      return;
    }

    if (form.type === "EXTERNO" && !email.endsWith("@gmail.com")) {
      setMessage(
        "⚠️ Los usuarios externos deben usar un correo Gmail (@gmail.com)."
      );
      return;
    }

    try {
      const { data } = await api.post("/api/registrations", {
        full_name: form.full_name,
        email: email,
        phone: form.phone,
        type: form.type,
        activity_id: id,
        school: null,
        university_id: null,
      });

      // ✅ Registro exitoso
      setMessage(
        data.message || "✅ Registro exitoso. Revisa tu correo para tu QR."
      );
      setForm({ full_name: "", type: "", email: "", phone: "" });

      // Redirigir si todo salió bien
      if (data.message?.includes("✅") || data.message?.includes("correctamente")) {
        setTimeout(() => navigate("/gracias"), 2000);
      }
    } catch (err) {
      console.error("❌ Error en frontend:", err);
    
      const backendMsg = err.response?.data?.message || "Error desconocido";
      const type = err.response?.data?.error_type || "";
    
      if (type === "PHONE_CONFLICT") {
        setMessage("⚠️ El correo electrónico ya pertenece a otro usuario.");
      } else if (type === "EMAIL_CONFLICT") {
        setMessage("⚠️ El número de teléfono ya pertenece a otro usuario.");
      } else if (backendMsg.includes("Ya estás inscrito")) {
        setMessage("⚠️ Ya estás inscrito en esta actividad.");
      } else {
        setMessage(backendMsg);
      }
    }
    
    
    
    
  };

  if (!activity) return <p>Cargando actividad...</p>;

  return (
    <div className="page-container">
      <h2>📝 Inscripción directa</h2>
      <h3>{activity.title}</h3>
      <p>
        📅 {activity.day?.slice(0, 10)} — ⏰ {activity.hour?.slice(0, 5)}
        <br />📍 {activity.location || "Sin lugar"}
      </p>

      <form onSubmit={handleSubmit} className="card">
        <label>Nombre completo</label>
        <input
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          required
        />

        <label>Tipo de usuario</label>
        <select name="type" value={form.type} onChange={handleChange} required>
          <option value="">Selecciona...</option>
          <option value="INTERNO">Alumno Interno</option>
          <option value="EXTERNO">Alumno Externo</option>
        </select>

        <label>Correo electrónico</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Teléfono</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <button type="submit">Inscribirme</button>
      </form>

      {message && (
        <p
          className={
            message.includes("⚠️") ? "msg-error" : "msg-success"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
