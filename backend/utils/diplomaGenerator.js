// ============================================================
// 🎓 GENERADOR DE DIPLOMAS PDF – CONGRESO UMG (Fondo azul)
// ============================================================
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// 📂 Carpeta base de almacenamiento
const STORAGE_PATH = path.join(__dirname, "..", "storage", "diplomas");

// Crear carpeta si no existe
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
  console.log("📁 Carpeta de diplomas creada:", STORAGE_PATH);
}

async function generateDiploma({ userName, activityName, date, userId, activityId }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 horizontal
  const { width, height } = page.getSize();

  // 🎨 Colores institucionales
  const colorBlue = rgb(0.07, 0.18, 0.40);  // azul oscuro elegante
  const colorGold = rgb(0.95, 0.78, 0.20);
  const colorWhite = rgb(1, 1, 1);

  // 🟦 Fondo azul completo
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

  // 🏛️ Escudo UMG
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

  // 🏫 Nombre universidad
  const titleText = "UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA";
  const titleWidth = fontBold.widthOfTextAtSize(titleText, 18);
  page.drawText(titleText, {
    x: width / 2 - titleWidth / 2,
    y: height - 170,
    size: 18,
    font: fontBold,
    color: colorGold,
  });

  // 🪶 Otorga el presente
  const otorgatext = "Otorga el presente";
  const otorgaWidth = fontRegular.widthOfTextAtSize(otorgatext, 14);
  page.drawText(otorgatext, {
    x: width / 2 - otorgaWidth / 2,
    y: height - 210,
    size: 14,
    font: fontRegular,
    color: colorWhite,
  });

  // 🥇 Diploma de participación
  const diplomaText = "DIPLOMA DE PARTICIPACIÓN";
  const diplomaWidth = fontBold.widthOfTextAtSize(diplomaText, 24);
  page.drawText(diplomaText, {
    x: width / 2 - diplomaWidth / 2,
    y: height - 245,
    size: 24,
    font: fontBold,
    color: colorGold,
  });

  // 👤 Nombre del participante
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
  page.drawText("__________________________", { x: 120, y: 100, size: 12, font: fontRegular, color: colorWhite });
  page.drawText("__________________________", { x: width - 320, y: 100, size: 12, font: fontRegular, color: colorWhite });
  page.drawText("Coordinador del Congreso", { x: 145, y: 85, size: 10, font: fontRegular, color: colorWhite });
  page.drawText("Decano de la Facultad de Ingeniería", { x: width - 315, y: 85, size: 10, font: fontRegular, color: colorWhite });

  // 💾 Guardar PDF
  const pdfBytes = await pdfDoc.save();
  const folder = path.join(STORAGE_PATH, String(userId));
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const fileName = `${activityId}.pdf`;
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  console.log(`✅ Diploma generado: ${filePath}`);
  return { filePath, fileName };
}

// ============================================================
// 🏆 GENERADOR DE DIPLOMAS PDF – GANADORES (1°, 2°, 3°)
// ============================================================

async function generateWinnerDiploma({ userName, activityName, position, year, userId, activityId }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  // 🎨 Colores institucionales base
  const colorBlue = rgb(0.07, 0.18, 0.40);
  const colorGold = rgb(0.95, 0.78, 0.20);
  const colorSilver = rgb(0.82, 0.82, 0.82);
  const colorBronze = rgb(0.80, 0.50, 0.20);
  const colorWhite = rgb(1, 1, 1);

  // 🎖️ Fondo según posición
  const bgColor =
    position === 1 ? colorGold :
    position === 2 ? colorSilver :
    position === 3 ? colorBronze :
    colorBlue;

  // Fondo principal (tono del lugar)
  page.drawRectangle({ x: 0, y: 0, width, height, color: bgColor });

  // Marco azul elegante
  const border = 25;
  page.drawRectangle({
    x: border,
    y: border,
    width: width - border * 2,
    height: height - border * 2,
    borderWidth: 4,
    color: bgColor,
    borderColor: colorBlue,
  });

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 🏛️ Escudo institucional
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

  // 🏫 Encabezado
  const titleText = "UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA";
  const titleWidth = fontBold.widthOfTextAtSize(titleText, 18);
  page.drawText(titleText, {
    x: width / 2 - titleWidth / 2,
    y: height - 170,
    size: 18,
    font: fontBold,
    color: colorBlue,
  });

  const subtitle = "Congreso de Tecnología UMG 2025";
  const subWidth = fontRegular.widthOfTextAtSize(subtitle, 14);
  page.drawText(subtitle, {
    x: width / 2 - subWidth / 2,
    y: height - 195,
    size: 14,
    font: fontRegular,
    color: colorBlue,
  });

  // 🏆 Texto principal
  const diplomaText = "DIPLOMA DE RECONOCIMIENTO";
  const diplomaWidth = fontBold.widthOfTextAtSize(diplomaText, 26);
  page.drawText(diplomaText, {
    x: width / 2 - diplomaWidth / 2,
    y: height - 240,
    size: 26,
    font: fontBold,
    color: colorWhite,
  });

  const userText = userName.toUpperCase();
  const userWidth = fontBold.widthOfTextAtSize(userText, 22);
  page.drawText(userText, {
    x: width / 2 - userWidth / 2,
    y: height - 285,
    size: 22,
    font: fontBold,
    color: colorBlue,
  });

  // 🥇 Texto de mérito
  const positionText =
    position === 1
      ? "🥇 Primer Lugar"
      : position === 2
      ? "🥈 Segundo Lugar"
      : "🥉 Tercer Lugar";

  const reasonText = `Por haber obtenido el ${positionText} en la actividad "${activityName}" durante el Congreso ${year}.`;
  const reasonWidth = fontRegular.widthOfTextAtSize(reasonText, 14);
  page.drawText(reasonText, {
    x: width / 2 - reasonWidth / 2,
    y: height - 320,
    size: 14,
    font: fontRegular,
    color: colorBlue,
  });

  // ✍️ Firmas
  page.drawText("__________________________", { x: 120, y: 100, size: 12, font: fontRegular, color: colorBlue });
  page.drawText("__________________________", { x: width - 320, y: 100, size: 12, font: fontRegular, color: colorBlue });
  page.drawText("Coordinador del Congreso", { x: 145, y: 85, size: 10, font: fontRegular, color: colorBlue });
  page.drawText("Decano de la Facultad de Ingeniería", { x: width - 315, y: 85, size: 10, font: fontRegular, color: colorBlue });

  // Guardar PDF
  const pdfBytes = await pdfDoc.save();
  const folder = path.join(STORAGE_PATH, String(userId));
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const fileName = `${activityId}_ganador.pdf`;
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  console.log(`✅ Diploma de ganador generado: ${filePath}`);
  return { filePath, fileName };
}

module.exports = { generateDiploma };
