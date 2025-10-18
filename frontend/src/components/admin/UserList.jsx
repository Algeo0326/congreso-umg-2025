//UserList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/admin.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    school: "",
    type: ""
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate(); // ← para retroceder

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await api.get("/api/users");
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/api/users/${editingId}`, form);
    } else {
      await api.post("/api/users", form);
    }
    setForm({ full_name: "", email: "", phone: "", school: "", type: "" });
    setEditingId(null);
    loadUsers();
  };

  const handleEdit = (u) => {
    setForm(u);
    setEditingId(u.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      await api.delete(`/api/users/${id}`);
      loadUsers();
    }
  };

  return (
    
    <div className="admin-body">
      <div className="admin-page">
        
        {/* 🔙 Botón de retroceso */}
        <div style={{ textAlign: "left", marginBottom: "1.Srem" }}>
        <button className="btn-transparent" onClick={() => navigate("/admin")}>
  ⬅️ Volver al Panel
</button>
        <h2 className="admin-title">👥 Gestión de Usuarios</h2>

        
        </div>

        <div className="admin-card">
          <form onSubmit={handleSubmit} className="admin-controls">
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo"
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Teléfono"
            />
            <input
              name="school"
              value={form.school}
              onChange={handleChange}
              placeholder="Institución"
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="" disabled hidden>
                Selecciona tipo de usuario
              </option>
              <option value="EXTERNO">Externo</option>
              <option value="INTERNO">Interno</option>
            </select>
            <button type="submit">
              {editingId ? "Actualizar" : "Agregar"}
            </button>
          </form>

          {loading && <p>Cargando usuarios...</p>}
          {error && <p className="msg-error">{error}</p>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.type}</td>
                  <td>
                    <button onClick={() => handleEdit(u)}>✏️</button>
                    <button onClick={() => handleDelete(u.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
