// ============================================================
// 📧 UTILIDAD DE ENVÍO DE CORREOS – CONGRESO UMG 2025 (Resend API, QR visible)
// ============================================================

const { Resend } = require("resend");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

// ============================================================
// 🚀 CONFIGURACIÓN DEL CLIENTE RESEND
// ============================================================

const resend = new Resend(process.env.RESEND_API_KEY);
const MAIL_FROM = process.env.MAIL_FROM || "Congreso UMG <onboarding@resend.dev>";

// ============================================================
// 📩 FUNCIÓN PRINCIPAL: ENVÍO DE CONFIRMACIÓN DE INSCRIPCIÓN
// ============================================================

async function sendConfirmationEmail(to, fullName, activity, qrLink) {
  try {
    // 1️⃣ Generar QR como archivo temporal (mejor compatibilidad HTML)
    const qrPath = path.join(__dirname, `qr-${Date.now()}.png`);
    await QRCode.toFile(qrPath, qrLink, {
      color: { dark: "#000000", light: "#ffffff" },
      width: 300,
    });

    // 2️⃣ Convertir QR en base64 (más corto y seguro)
    const qrBase64 = fs.readFileSync(qrPath).toString("base64");
    const qrImgTag = `<img src="data:image/png;base64,${qrBase64}" width="220" height="220" alt="QR" style="display:block;margin:0 auto;">`;

    // 3️⃣ Logo embebido si existe
    const logoPath = path.resolve(__dirname, "escudo-umg.png");
    let logoImgTag = "";
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath).toString("base64");
      logoImgTag = `<img src="data:image/png;base64,${logoBase64}" width="130" height="130" style="border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.2);margin-bottom:15px;" alt="Escudo UMG">`;
    }

    // 4️⃣ Cuerpo del correo (HTML limpio)
    const html = `
      <div style="font-family:Arial,sans-serif;background:#f4f6fa;padding:25px;">
        <div style="text-align:center;">
          ${logoImgTag}
          <h1 style="color:#0a3a82;">Universidad Mariano Gálvez de Guatemala</h1>
          <h2 style="margin-top:-10px;">Congreso de Tecnología UMG 2025</h2>
        </div>
        <div style="background:white;border-radius:12px;padding:25px;box-shadow:0 0 10px rgba(0,0,0,0.1);margin-top:20px;">
          <h3 style="color:#0a3a82;">🎓 Confirmación de inscripción</h3>
          <p>Estimado(a) <b>${fullName}</b>, tu registro se ha completado exitosamente en la siguiente actividad:</p>
          <h3 style="color:#004aad;text-align:center;">${activity.title}</h3>
          <p style="text-align:center;line-height:1.6;">
            📅 <b>${activity.day ?? "Fecha por confirmar"}</b><br/>
            ⏰ <b>${activity.hour ?? "Hora por confirmar"}</b><br/>
            📍 <b>${activity.location || "Lugar por confirmar"}</b>
          </p>
          <hr/>
          <p style="text-align:center;">🎟️ <b>Tu código QR de asistencia:</b></p>
          <div style="text-align:center;margin:15px 0;">${qrImgTag}</div>
          <p style="text-align:center;font-size:14px;color:#555;">
            Escanea este código o haz clic en el botón para confirmar asistencia.
          </p>
          <div style="text-align:center;margin-top:10px;">
            <a href="${qrLink}" style="background:#0a3a82;color:white;padding:12px 30px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;">
              ✅ Confirmar Asistencia
            </a>
          </div>
        </div>
        <div style="text-align:center;font-size:12px;color:#777;margin-top:20px;">
          <hr style="border:0;border-top:1px solid #ccc;width:60%;margin:15px auto;">
          <p>Atentamente,<br><b>Unidad de Tecnología – Universidad Mariano Gálvez</b></p>
          <p>© ${new Date().getFullYear()} UMG – Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    // 5️⃣ Enviar con Resend
    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject: `🎟️ Confirmación de inscripción - ${activity.title}`,
      html,
    });

    if (error) {
      console.error("❌ Error Resend:", error);
      throw new Error(error.message);
    }

    console.log(`📩 Correo enviado correctamente a ${to}`, data?.id || "(sin ID)");

    // 6️⃣ Eliminar QR temporal
    fs.unlinkSync(qrPath);
  } catch (err) {
    console.error("❌ Error al enviar correo:", err.message || err);
    throw err;
  }
}

module.exports = { sendConfirmationEmail };
