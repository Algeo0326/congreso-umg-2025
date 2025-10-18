import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

export default function Attendance() {
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("❌ No se encontró un token válido en el enlace.");
      return;
    }

    async function registerAttendance() {
      try {
        const { data } = await api.post("/api/attendance", { token });
        setInfo(data);
        setStatus("success");
      } catch (err) {
        console.error("❌ Error al registrar asistencia:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "❌ Ocurrió un error al registrar la asistencia."
        );
      }
    }

    registerAttendance();
  }, [location]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:
          status === "success"
            ? "linear-gradient(135deg, #1a3b80, #5DC3AB)"
            : "linear-gradient(135deg, #7b1f1f, #2c0d0d)",
        color: "white",
        fontFamily: "Poppins, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {/* 🕐 Mientras carga */}
      {status === "loading" && <h2>⏳ Verificando asistencia...</h2>}

      {/* ❌ Error */}
      {status === "error" && (
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "40px",
            borderRadius: "16px",
            maxWidth: "450px",
          }}
        >
          <h2>📋 Registro de Asistencia</h2>
          <p style={{ fontSize: "18px", marginTop: "10px" }}>{message}</p>
        </div>
      )}

      {/* ✅ Éxito */}
      {status === "success" && info && (
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            padding: "50px",
            borderRadius: "20px",
            boxShadow: "0 0 25px rgba(0,0,0,0.2)",
            maxWidth: "500px",
            animation: "fadeIn 1s ease",
          }}
        >
          {/* Círculo con animación */}
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "white",
              color: "#1a3b80",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              margin: "0 auto 20px",
              boxShadow: "0 0 20px rgba(255,255,255,0.8)",
              animation: "popIn 0.6s ease",
            }}
          >
            ✅
          </div>

          <h1 style={{ fontSize: "2em", marginBottom: "15px" }}>
            Asistencia registrada
          </h1>
          <h2 style={{ color: "#F7D232", marginBottom: "10px" }}>
            {info.activity_title || "Actividad desconocida"}
          </h2>

          <p style={{ fontSize: "18px" }}>
            👤 <strong>{info.full_name}</strong>
          </p>

          <p style={{ fontSize: "16px", marginTop: "10px" }}>
            📅{" "}
            {info.attended_at
              ? new Date(info.attended_at).toLocaleString("es-GT")
              : "Fecha no disponible"}
          </p>

          <p style={{ marginTop: "20px", fontSize: "15px", color: "#e0e0e0" }}>
            ¡Gracias por participar en el Congreso de Tecnología UMG 2025!
          </p>
        </div>
      )}

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
