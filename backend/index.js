// ============================================================
// 🎯 CONFIGURACIÓN PRINCIPAL DEL BACKEND CONGRESO UMG
// ============================================================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = require("./db"); // conexión a MySQL
const app = express();

// ============================================================
// 🧩 MIDDLEWARES
// ============================================================

// 🔹 CORS dinámico: permite solicitudes desde local y desde dominios Vercel
const allowedOrigins = [
  "http://localhost:3000", // desarrollo local
  "http://10.238.141.178:3000", // pruebas locales
  "https://congreso-umg-2025-vercel.app", // dominio antiguo (por compatibilidad)
  "https://congreso-umg-2025-vitz.vercel.app", // dominio principal de producción
  "https://congreso-umg-2025-vitz-qg7m1mm3a.vercel.app", // dominio alterno (redeploy)
  "https://congreso-umg-20-git-b7974c-angel-algeo-aldana-cardonas-projects.vercel.app", // dominio temporal GitHub build
];

// Permitir cualquier dominio *.vercel.app para evitar errores en futuros redeploys
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        console.warn("🚫 Bloqueado intento CORS desde:", origin);
        callback(new Error("CORS no permitido"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 🔹 Parseo de JSON (hasta 10 MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ============================================================
// 🗂️ ARCHIVOS ESTÁTICOS (Diplomas PDF)
// ============================================================

const storagePath = path.join(__dirname, "storage", "diplomas");
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log("📁 Carpeta de diplomas creada:", storagePath);
}
app.use("/storage", express.static(path.join(__dirname, "storage")));

// ============================================================
// 🗺️ RUTAS PRINCIPALES
// ============================================================

app.use("/api/activities", require("./routes/activities"));
app.use("/api/registrations", require("./routes/registrations"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/users", require("./routes/users"));
app.use("/api/winners", require("./routes/winners"));
app.use("/api/diplomas", require("./routes/diplomas"));
app.use("/api/reports", require("./routes/reports"));

// ============================================================
// 🚀 SERVIDOR (AJUSTADO PARA RAILWAY)
// ============================================================

// ⚠️ Railway asigna su propio puerto dinámico
const PORT = process.env.PORT || 8080;

// 🔹 Endpoint raíz para verificación rápida
app.get("/", (req, res) => {
  res.send("✅ Backend Congreso UMG 2025 está en línea 🚀");
});

// 🔹 Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor iniciado en puerto ${PORT}`);
  console.log(`🌐 Backend público (Railway) activo`);
  console.log(`📂 Diplomas: ${storagePath}`);
  console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
});
