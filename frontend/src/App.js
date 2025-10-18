// ============================================================
// 🎯 APLICACIÓN PRINCIPAL - CONGRESO DE TECNOLOGÍA UMG 2025
// ============================================================

import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect, useRef, createContext, useContext } from "react";

import HomePage from "./components/HomePage";
import ActivityList from "./components/ActivityList";
import UserRegister from "./components/UserRegister";
import InternalRegister from "./components/InternalRegister";
import Registration from "./components/Registration";
import Attendance from "./components/Attendance";
import ThankYouPage from "./components/ThankYouPage";



import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import UserList from "./components/admin/UserList";
import ActivityManager from "./components/admin/ActivityManager";
import PrivateAdminRoute from "./components/admin/PrivateAdminRoute";
import DiplomasAdmin from "./components/admin/DiplomasAdmin";
import WinnersAdmin from "./components/admin/WinnersAdmin";
import WinnersHistory from "./components/admin/WinnersHistory";
import ReportsAdmin from "./components/admin/ReportsAdmin";


import "./styles.css";

// ============================================================
// 🧭 CONTEXTO GLOBAL PARA EL DROPDOWN
// ============================================================
const DropdownContext = createContext();
export const useDropdown = () => useContext(DropdownContext);

function Layout() {
  const [createdUserId, setCreatedUserId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);
  const openDropdown = () => setDropdownOpen(true);

  // 👂 Evento global para abrir el dropdown desde otras páginas
  useEffect(() => {
    const handleOpenDropdown = () => setDropdownOpen(true);
    window.addEventListener("openInscripcion", handleOpenDropdown);
    return () => window.removeEventListener("openInscripcion", handleOpenDropdown);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar al cambiar de ruta
  useEffect(() => {
    closeDropdown();
  }, [location]);

  // 🔹 Rutas donde ocultar navbar/footer
  const hideLayoutPaths = [
    "/externos",
    "/internos",
    "/asistencia",
    "/gracias",
    "/admin",
    "/admin/login",
  ];
  const hideLayout = hideLayoutPaths.some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <DropdownContext.Provider value={{ openDropdown }}>
      {/* ===== NAVBAR ===== */}
      {!hideLayout && (
        <header className="navbar">
          <div className="brand">Congreso UMG</div>
          <nav className="menu">
            <Link to="/" onClick={closeDropdown}>
              Inicio
            </Link>

          

            <div className="dropdown" id="inscripcion-dropdown" ref={dropdownRef}>
              <button className="dropbtn" onClick={toggleDropdown}>
                Inscripción ▾
              </button>
              <div className={`dropdown-content ${dropdownOpen ? "show" : ""}`}>
                <Link to="/externos" onClick={closeDropdown}>
                  Soy Alumno Externo
                </Link>
                <Link to="/internos" onClick={closeDropdown}>
                  Soy Alumno Interno
                </Link>
              </div>
            </div>
          </nav>
        </header>
      )}

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="main-content">
        <Routes>
          {/* 🌐 Página principal */}
          <Route path="/" element={<HomePage />} />

          {/* 🔹 Ruta fantasma (mantiene compatibilidad) */}
          <Route path="/openDropdown" element={<HomePage />} />

          {/* 👤 Externos */}
          <Route
            path="/externos"
            element={
              <div className="page-container">
                <h2>👤 Inscripción de Usuarios Externos</h2>
                <UserRegister onCreated={(id) => setCreatedUserId(id)} />
                <h3>📝 Inscripción a Actividades</h3>
                <Registration initialUserId={createdUserId} />
                <h3>📅 Actividades Disponibles</h3>
                <ActivityList />
               
              </div>
            }
          />

          {/* 🎓 Internos */}
          <Route
            path="/internos"
            element={
              <div className="page-container">
                <h2>🎓 Registro de Alumnos Internos</h2>
                <InternalRegister onCreated={(id) => setCreatedUserId(id)} />
                <h3>📝 Inscripción a Actividades</h3>
                <Registration initialUserId={createdUserId} />
                <h3>📅 Actividades Disponibles</h3>
                <ActivityList />
              
              </div>
            }
          />

          {/* 🧾 Registro de asistencia (por QR o por token) */}
          <Route path="/asistencia" element={<Attendance />} />
          <Route path="/asistencia/:token" element={<Attendance />} />

          {/* ✅ Página de agradecimiento */}
          <Route path="/gracias" element={<ThankYouPage />} />

        
          {/* 🧑‍💼 ADMIN */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <PrivateAdminRoute>
                <AdminDashboard />
              </PrivateAdminRoute>
            }
          />
        

       
          <Route
            path="/admin/usuarios"
            element={
              <PrivateAdminRoute>
                <UserList />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/admin/actividades"
            element={
              <PrivateAdminRoute>
                <ActivityManager />
              </PrivateAdminRoute>
            }
          />


<Route
  path="/admin/diplomas"
  element={
    <PrivateAdminRoute>
      <DiplomasAdmin />
    </PrivateAdminRoute>
  }
/>

<Route
  path="/admin/ganadores"
  element={
    <PrivateAdminRoute>
      <WinnersAdmin />
    </PrivateAdminRoute>
  }
/>

<Route
  path="/admin/historico"
  element={
    <PrivateAdminRoute>
      <WinnersHistory />
    </PrivateAdminRoute>
  }
/>
<Route
  path="/admin/reportes"
  element={
    <PrivateAdminRoute>
      <ReportsAdmin />
    </PrivateAdminRoute>
  }
/>


          {/* ⚡ Inscripción rápida → redirige al Home y abre dropdown */}
          <Route path="/inscripcion-actividad/:id" element={<RedirectToHome />} />
        </Routes>
      </main>

      {/* ===== FOOTER ===== */}
      {!hideLayout && (
        <footer className="footer">
          <p>© {new Date().getFullYear()} Congreso UMG — Todos los derechos reservados</p>
          <p>
            Desarrollado para{" "}
            <strong>Universidad Mariano Gálvez de Guatemala</strong>
          </p>
        </footer>
      )}
    </DropdownContext.Provider>
  );
}

// 🔁 Redirige la inscripción rápida al inicio y abre el menú Inscripción
function RedirectToHome() {
  const navigate = useNavigate();
  useEffect(() => {
    window.dispatchEvent(new Event("openInscripcion"));
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
