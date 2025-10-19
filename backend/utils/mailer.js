// ============================================================
// 📧 ENVÍO DE CORREOS – CONGRESO UMG 2025 (Resend API Oficial)
// ============================================================

const { Resend } = require("resend");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Inicializa cliente Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// 📩 FUNCIÓN PRINCIPAL: ENVÍO DE CONFIRMACIÓN DE INSCRIPCIÓN
// ============================================================

async function sendConfirmationEmail(to, fullName, activity, qrLink) {
  try {
    // 1️⃣ Generar QR temporal
    const qrBuffer = await QRCode.toBuffer(qrLink, {
      color: { dark: "#000000", light: "#ffffff" },
      width: 250,
    });

    // 2️⃣ Verificar si existe logo UMG
    const logoPath = path.resolve(__dirname, "escudo-umg.png");
    const hasLogo = fs.existsSync(logoPath);
    const logoBase64 = hasLogo
      ? fs.readFileSync(logoPath).toString("base64")
      : null;

    // 3️⃣ Plantilla HTML del correo
    const html = `
      <div style="font-family: Arial, sans-serif; color:#333; background:#f3f6fa; padding:25px; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          ${
            hasLogo
              ? `<img src="cid:umglogo" alt="Escudo UMG" style="width:130px;height:130px;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.2);"/>`
              : ""
          }
          <h1 style="color:#0a3a82; margin:15px 0 5px;">Universidad Mariano Gálvez de Guatemala</h1>
          <h2 style="margin:5px 0 0;">Congreso de Tecnología UMG 2025</h2>
        </div>

        <div style="background:#ffffff; border-radius:12px; padding:25px; box-shadow:0 0 15px rgba(0,0,0,0.1);">
          <h2 style="color:#0a3a82;">🎓 Confirmación de inscripción</h2>
          <p>Estimado(a) <b>${fullName}</b>,</p>
          <p>Tu registro se ha completado exitosamente en la siguiente actividad:</p>

          <h3 style="color:#004aad;">${activity.title}</h3>
          <p style="line-height:1.6; font-size:15px;">
            📅 <b>${activity.day ?? "Fecha por confirmar"}</b><br/>
            ⏰ <b>${activity.hour ?? "Hora por confirmar"}</b><br/>
            📍 <b>${activity.location || "Lugar por confirmar"}</b>
          </p>

          <hr style="margin:20px 0; border:0; border-top:1px solid #ddd;"/>

          <p>🎟️ <b>Tu código QR de asistencia:</b></p>
          <div style="text-align:center;margin:15px 0;">
            <img src="cid:qrimage" style="width:220px;height:220px;" alt="QR"/>
          </div>
          <p style="font-size:14px; color:#555; text-align:center;">
            Escanea este código al ingresar al evento o haz clic en el siguiente botón para confirmar asistencia.
          </p>

          <div style="text-align:center;margin-top:15px;">
            <a href="${qrLink}"
               style="background:#0a3a82;color:white;padding:12px 30px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">
              ✅ Confirmar Asistencia
            </a>
          </div>

          <p style="margin-top:25px; font-size:13px; color:#777; text-align:center;">
            Este código y enlace están vinculados exclusivamente al evento:<br/>
            <b style="color:#004aad;">${activity.title}</b>
          </p>
        </div>

        <div style="margin-top:35px; text-align:center; color:#555;">
          <hr style="border:0; border-top:1px solid #ccc; width:60%; margin:20px auto;"/>
          <p style="font-size:14px; line-height:1.5;">
            Atentamente,<br/>
            <b style="color:#0a3a82;">Unidad de Tecnología<br/>
            Universidad Mariano Gálvez de Guatemala</b><br/>
            <span style="font-size:12px; color:#777;">Sede Central — Zona 2, Ciudad de Guatemala</span>
          </p>
          <p style="font-size:12px; color:#888; margin-top:10px;">
            © ${new Date().getFullYear()} Universidad Mariano Gálvez — Todos los derechos reservados
          </p>
        </div>
      </div>
    `;

    // 4️⃣ Enviar correo vía Resend API
    const attachments = [
      {
        filename: "qr.png",
        content: qrBuffer.toString("base64"),
        content_id: "qrimage",
      },
    ];

    if (hasLogo) {
      attachments.push({
        filename: "escudo-umg.png",
        content: logoBase64,
        content_id: "umglogo",
      });
    }

    await resend.emails.send({
      from: process.env.MAIL_FROM || "Congreso UMG <onboarding@resend.dev>",
      to,
      subject: `🎟️ Confirmación de inscripción - ${activity.title}`,
      html,
      attachments,
    });

    console.log(`📩 Correo enviado correctamente a ${to}`);
  } catch (err) {
    console.error("❌ Error al enviar correo:", err.message || err);
    throw err;
  }
}

module.exports = { sendConfirmationEmail };
