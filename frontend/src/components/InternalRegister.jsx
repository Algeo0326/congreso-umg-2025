import { useState } from "react";
import api from "../api";

export default function InternalRegister({ onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null); // 👈 Nuevo estado para mostrar el ID

  const isInstitutional = email.trim().toLowerCase().endsWith("@miumg.edu.gt");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setUserId(null);

    if (!isInstitutional) {
      setError("⚠️ El correo debe ser institucional (@miumg.edu.gt)");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/users", {
        full_name: name,
        email,
        type: "INTERNO",
      });

      setSuccess("🎓 Registro exitoso.");
      setUserId(data.id); // 👈 Guardamos el ID del usuario creado
      setName("");
      setEmail("");
      onCreated?.(data.id); // 👈 Enviamos el ID al padre (App.js)
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header header-blue">Registro de Alumnos Internos</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label>Correo institucional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              placeholder="nombre@miumg.edu.gt"
            />
            {!isInstitutional && email && (
              <p className="msg-error">
                ❌ El correo debe terminar en <strong>@miumg.edu.gt</strong>
              </p>
            )}
          </div>

          <button type="submit" disabled={!isInstitutional || loading}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>

        {success && <p className="msg-success">{success}</p>}
        {error && <p className="msg-error">{error}</p>}

        {/* 👇 Nuevo bloque para mostrar el ID del usuario creado */}
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
