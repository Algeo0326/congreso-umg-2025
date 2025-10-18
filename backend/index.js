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

// 🔹 Permitir solicitudes desde el frontend (local y red local)
app.use(
  cors({
    origin: [
      "http://localhost:3000",          // desde tu PC
      "http://10.238.141.178:3000",     // desde tu celular / red Wi-Fi
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 🔹 Parseo de JSON
// Aumentar el tamaño máximo del body (hasta 10 MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// ============================================================
// 🗂️ CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS (para diplomas)
// ============================================================

// Crear carpeta /storage/diplomas si no existe
const storagePath = path.join(__dirname, "storage", "diplomas");
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log("📁 Carpeta de diplomas creada:", storagePath);
}

// Servir archivos PDF desde /storage
app.use("/storage", express.static(path.join(__dirname, "storage")));

// ============================================================
// 🗺️ RUTAS PRINCIPALES
// ============================================================

app.use("/api/activities", require("./routes/activities"));
app.use("/api/registrations", require("./routes/registrations"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/users", require("./routes/users"));
// 🔹 Nueva ruta: Ganadores (Resultados de competencias)
app.use("/api/winners", require("./routes/winners"));
// 🔹 Nueva ruta: Diplomas (Módulo 3)
app.use("/api/diplomas", require("./routes/diplomas"));
app.use("/api/reports", require("./routes/reports"));

// ============================================================
// 🚀 SERVIDOR
// ============================================================

const PORT = process.env.PORT || 4000;

// 🔹 Escuchar en todas las IPs (no solo localhost)
console.log("🔍 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔍 EMAIL_PASS:", process.env.EMAIL_PASS ? "(oculta)" : "VACÍA");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor en ejecución: http://localhost:${PORT}`);
  console.log(`🌐 Accesible en red local: http://10.238.141.178:${PORT}`);
  console.log(`📂 Diplomas almacenados en: ${storagePath}`);
});
