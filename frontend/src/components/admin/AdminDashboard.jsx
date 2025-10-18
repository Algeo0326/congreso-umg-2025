import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../../styles/admin.css";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="admin-body">
      <div className="admin-page">
        <h1 className="admin-title">🎓 Panel de Administración</h1>
        <p style={{ textAlign: "center", marginBottom: "2rem" }}>
          Bienvenido, <strong>{user?.name || "Administrador"}</strong>
        </p>

        <div className="admin-card" style={{ textAlign: "center" }}>
          <nav
            className="home-buttons"
            style={{
              justifyContent: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
          
            <Link to="/admin/usuarios" className="btn-admin gold">
              👥 Usuarios
            </Link>
            <Link to="/admin/actividades" className="btn-admin cyan">
              📅 Actividades
            </Link>
        
            <Link to="/admin/diplomas" className="btn-admin green">
              🎓 Diplomas
            </Link>
            <Link to="/admin/ganadores" className="btn-admin purple" style={{ border: "none" }}>

              🏆 Publicacion de Ganadores
            
            </Link>
            <Link to="/admin/historico" className="btn-admin gray">
               🕓 Histórico de Ganadores
              </Link>
              <Link to="/admin/reportes" className="btn-admin blue">
               📊 Reportes de Asistencia
            </Link>

          </nav>
        </div>
      </div>
    </div>
  );
}
