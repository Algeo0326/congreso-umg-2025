//AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../../styles/admin.css";

export default function AdminLogin() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (email === "admin@umg.edu.gt" && password === "admin123") {
      setUser({ type: "ADMIN", name: "Administrador" });
      navigate("/admin");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="admin-body">
      <div className="login-page">
        <div className="login-card">
          <h2 className="admin-title">🔐 Ingreso Administrador</h2>

          <form className="login-form" onSubmit={handleLogin}>
            <div>
              <label>Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@umg.edu.gt"
                required
              />
            </div>

            <div>
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit">Iniciar Sesión</button>
          </form>

          {error && <p className="msg-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
