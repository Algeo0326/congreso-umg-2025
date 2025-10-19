// ============================================================
// 📧 UTILIDAD DE ENVÍO DE CORREOS – CONGRESO UMG 2025 (QR 100% visible en correo)
// ============================================================

const { Resend } = require("resend");

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
    // ✅ Generar QR visible mediante URL pública (no base64)
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      qrLink
    )}`;

    // ✅ HTML del correo
    const html = `
      <div style="font-family:Arial,sans-serif;background:#f4f6fa;padding:25px;">
        <div style="text-align:center;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Logo_UMG.png" 
               width="110" height="110" 
               style="border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.2);margin-bottom:10px;" 
               alt="Escudo UMG">
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

          <hr style="margin:20px 0;border:0;border-top:1px solid #ccc;">
          <p style="text-align:center;">🎟️ <b>Tu código QR de asistencia:</b></p>

          <div style="text-align:center;margin:15px 0;">
            <img src="${qrImageUrl}" width="220" height="220" alt="QR" style="display:block;margin:0 auto;">
          </div>

          <p style="text-align:center;font-size:14px;color:#555;">
            Escanea este código o haz clic en el botón para confirmar asistencia.
          </p>

          <div style="text-align:center;margin-top:10px;">
            <a href="${qrLink}" 
               style="background:#0a3a82;color:white;padding:12px 30px;border-radius:6px;
                      text-decoration:none;font-size:16px;font-weight:bold;">
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

    // ✅ Enviar correo con Resend
    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject: `🎟️ Confirmación de inscripción - ${activity.title}`,
      html,
    });

    if (error) throw new Error(error.message);

    console.log(`📩 Correo enviado correctamente a ${to}`, data?.id || "(sin ID)");
  } catch (err) {
    console.error("❌ Error al enviar correo:", err.message || err);
  }
}

module.exports = { sendConfirmationEmail };
