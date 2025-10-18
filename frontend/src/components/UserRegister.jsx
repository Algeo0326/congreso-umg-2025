import { useState } from "react";
import api from "../api";

export default function UserRegister({ onCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    school: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [userId, setUserId] = useState(null); // 👈 Nuevo estado para mostrar el ID

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setUserId(null);

    const email = form.email.trim().toLowerCase();

    // ✅ Validar dominio Gmail para externos
    if (!email.endsWith("@gmail.com")) {
      setErr("⚠️ Solo se permiten correos Gmail (@gmail.com) para usuarios externos.");
      return;
    }

    try {
      const { data } = await api.post("/api/users", form);
      setMsg("✅ Registro exitoso.");
      setUserId(data.id); // 👈 Guardamos el ID del usuario
      onCreated?.(data.id);
      setForm({ full_name: "", email: "", phone: "", school: "" });
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    }
  };

  return (
    <div className="card">
      <div className="card-header header-blue">Registro de Alumnos Externos</div>
      <div className="card-body">
        <form onSubmit={submit}>
          <div>
            <label>Nombre completo</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label>Correo (solo Gmail)</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="nombre@gmail.com"
            />
          </div>
          <div>
            <label>Teléfono</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Ej. 58973554"
            />
          </div>
          <div>
            <label>Colegio o institución</label>
            <input
              name="school"
              value={form.school}
              onChange={handleChange}
              placeholder="Ej. Colegio San José"
            />
          </div>
          <button type="submit">Registrar</button>
        </form>

        {msg && <p className="msg-success">{msg}</p>}
        {err && <p className="msg-error">{err}</p>}

        {/* 🆔 Mensaje bonito con el ID del usuario creado */}
        {userId && (
          <p className="msg-info">
            🆔 Tu ID de usuario es: <strong>{userId}</strong>  
            <br /> Usa este número para inscribirte a una actividad.
          </p>
        )}
      </div>
    </div>
  );
}
