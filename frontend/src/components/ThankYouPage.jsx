// src/components/ThankYouPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYouPage() {
  const [countdown, setCountdown] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    let seconds = 8;
    const interval = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      if (seconds <= 0) {
        clearInterval(interval);
        navigate("/"); // 🔁 redirige al inicio
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div
      className="card"
      style={{
        textAlign: "center",
        padding: "3rem",
        background:
          "linear-gradient(135deg, rgba(0,51,102,0.85), rgba(0,64,128,0.85))",
        color: "#fff",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        maxWidth: "600px",
        margin: "4rem auto",
      }}
    >
      <h2 style={{ color: "#F7D232" }}>🎉 ¡Gracias por tu inscripción!</h2>
      <p style={{ fontSize: "1.1rem", marginTop: "1rem" }}>
        Recibirás un correo electrónico con tu código QR 📩
      </p>
      <p style={{ fontSize: "1rem", opacity: 0.9 }}>
        Este código es necesario para registrar tu asistencia al evento.
      </p>

      {/* Contador */}
      <p
        style={{
          color: "#F7D232",
          fontWeight: "bold",
          marginTop: "2rem",
          fontSize: "1rem",
        }}
      >
        Redirigiendo al inicio en {countdown} segundos...
      </p>

      {/* Barra de progreso */}
      <div
        style={{
          width: "100%",
          height: "10px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "5px",
          overflow: "hidden",
          marginTop: "0.5rem",
        }}
      >
        <div
          style={{
            width: `${((8 - countdown) / 8) * 100}%`,
            height: "100%",
            background: "#F7D232",
            transition: "width 1s linear",
          }}
        ></div>
      </div>
    </div>
  );
}
