// ============================================================
// 📩 PRUEBA DE ENVÍO DE CORREO – CONGRESO UMG
// ============================================================
require("dotenv").config();
const nodemailer = require("nodemailer");

(async () => {
  try {
    console.log("📧 Probando envío de correo...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Congreso UMG" <${process.env.EMAIL_USER}>`,
      to: "angelcard0326@gmail.com",
      subject: "📩 Prueba de correo desde el backend",
      text: "Hola Ángel 👋, este es un correo de prueba enviado desde el backend del Congreso UMG.",
    });

    console.log("✅ Correo enviado correctamente:", info.response);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
  }
})();
