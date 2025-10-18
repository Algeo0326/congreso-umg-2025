require("dotenv").config();
const mysql = require("mysql2/promise");

// ============================================================
// 🗄️ CONEXIÓN MYSQL (Railway)
// ============================================================

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306, // necesario para Railway
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
