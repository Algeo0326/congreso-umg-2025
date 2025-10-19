// ============================================================
// 🎓 GENERADOR DE DIPLOMAS PDF – CONGRESO UMG (Fondo azul)
// ============================================================
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// 📂 Carpeta base de almacenamiento
const STORAGE_PATH = path.join(__dirname, "..", "storage", "diplomas");

// Crear carpeta base si no existe
fs.mkdirSync(STORAGE_PATH, { recursive: true });
console.log("📁 Carpeta de diplomas lista:", STORAGE_PATH);

// ============================================================
// 🧾 FUNCIÓN PRINCIPAL: GENERAR DIPLOMA PDF DE PARTICIPACIÓN
// ============================================================
async function generateDiploma({ userName, activityName, date, userId, activityId }) {
  try {
    // Crear el documento
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 horizontal
    const { width, height } = page.getSize();

    // 🎨 Colores institucionales
    const colorBlue = rgb(0.07, 0.18, 0.40); // Azul UMG
    const colorGold = rgb(0.95, 0.78, 0.20);
    const colorWhite = rgb(1, 1, 1);

    // 🟦 Fondo azul
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: colorBlue,
    });

    // 🟨 Borde dorado
    const border = 25;
    page.drawRectangle({
      x: border,
      y: border,
      width: width - border * 2,
      height: height - border * 2,
      borderWidth: 4,
      color: colorBlue,
      borderColor: colorGold,
    });

    // ✍️ Fuentes
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 🏛️ Escudo institucional (si existe)
    const escudoPath = path.join(__dirname, "escudo-umg.png");
    if (fs.existsSync(escudoPath)) {
      const imageBytes = fs.readFileSync(escudoPath);
      const escudoImage = await pdfDoc.embedPng(imageBytes);
      const escudoDims = escudoImage.scale(0.25);
      page.drawImage(escudoImage, {
        x: width / 2 - escudoDims.width / 2,
        y: height - escudoDims.height - 45,
        width: escudoDims.width,
        height: escudoDims.height,
      });
    }

    // 🏫 Título
    const titleText = "UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA";
    const titleWidth = fontBold.widthOfTextAtSize(titleText, 18);
    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - 170,
      size: 18,
      font: fontBold,
      color: colorGold,
    });

    // 🪶 Subtítulo
    const otorgatext = "Otorga el presente";
    const otorgaWidth = fontRegular.widthOfTextAtSize(otorgatext, 14);
    page.drawText(otorgatext, {
      x: width / 2 - otorgaWidth / 2,
      y: height - 210,
      size: 14,
      font: fontRegular,
      color: colorWhite,
    });

    // 🥇 Título principal
    const diplomaText = "DIPLOMA DE PARTICIPACIÓN";
    const diplomaWidth = fontBold.widthOfTextAtSize(diplomaText, 24);
    page.drawText(diplomaText, {
      x: width / 2 - diplomaWidth / 2,
      y: height - 245,
      size: 24,
      font: fontBold,
      color: colorGold,
    });

    // 👤 Nombre
    const nameWidth = fontBold.widthOfTextAtSize(userName.toUpperCase(), 22);
    page.drawText(userName.toUpperCase(), {
      x: width / 2 - nameWidth / 2,
      y: height - 295,
      size: 22,
      font: fontBold,
      color: colorWhite,
    });

    // 📘 Actividad
    const actText = `Por su valiosa participación en la actividad "${activityName}".`;
    const actWidth = fontRegular.widthOfTextAtSize(actText, 14);
    page.drawText(actText, {
      x: width / 2 - actWidth / 2,
      y: height - 330,
      size: 14,
      font: fontRegular,
      color: colorWhite,
    });

    // 📅 Fecha
    const dateText = `Guatemala, ${date}`;
    const dateWidth = fontRegular.widthOfTextAtSize(dateText, 12);
    page.drawText(dateText, {
      x: width / 2 - dateWidth / 2,
      y: height - 365,
      size: 12,
      font: fontRegular,
      color: colorWhite,
    });

    // 🖋️ Firmas
    page.drawText("__________________________", {
      x: 120,
      y: 100,
      size: 12,
      font: fontRegular,
      color: colorWhite,
    });
    page.drawText("__________________________", {
      x: width - 320,
      y: 100,
      size: 12,
      font: fontRegular,
      color: colorWhite,
    });
    page.drawText("Coordinador del Congreso", {
      x: 145,
      y: 85,
      size: 10,
      font: fontRegular,
      color: colorWhite,
    });
    page.drawText("Decano de la Facultad de Ingeniería", {
      x: width - 315,
      y: 85,
      size: 10,
      font: fontRegular,
      color: colorWhite,
    });

    // 💾 Guardar PDF
    const pdfBytes = await pdfDoc.save();

    // 📁 Crear carpeta del usuario si no existe
    const userFolder = path.join(STORAGE_PATH, String(userId));
    fs.mkdirSync(userFolder, { recursive: true }); // ✅ evita ENOENT

    const fileName = `${activityId}.pdf`;
    const filePath = path.join(userFolder, fileName);

    fs.writeFileSync(filePath, pdfBytes);
    console.log(`✅ Diploma generado: ${filePath}`);

    return { filePath, fileName };
  } catch (err) {
    console.error("❌ Error generando diploma:", err.message);
    throw err;
  }
}

module.exports = { generateDiploma };
