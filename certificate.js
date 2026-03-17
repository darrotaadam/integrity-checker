const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const { hash } = require('crypto');

export async function generateCertificate({
  fileName,
  signDate,
  signerAddress,
  documentHash
}) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([550, 750]);
  const { width, height } = page.getSize();

  // Embed the Helvetica font
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Draw a nice background rectangle
  page.drawRectangle({
    x: 50,
    y: 650,
    width: width - 100,
    height: 200,
    borderWidth: 2,
    borderColor: rgb(0.2, 0.4, 0.8),
    color: rgb(0.95, 0.95, 1),
  });

  // Title
  page.drawText('CERTIFICAT DE SIGNATURE', {
    x: 70,
    y: 700,
    size: 24,
    font: helveticaBold,
    color: rgb(0.2, 0.4, 0.8),
  });

  // Subtitle
  page.drawText('Ce document atteste de l\'authenticité et de l\'intégrité du fichier signé.', {
    x: 70,
    y: 670,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Document info
  page.drawText(`Nom du fichier :`, {
    x: 70,
    y: 600,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(fileName, {
    x: 200,
    y: 600,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Date de signature :`, {
    x: 70,
    y: 570,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(signDate, {
    x: 200,
    y: 570,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Adresse du signataire :`, {
    x: 70,
    y: 540,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(signerAddress, {
    x: 200,
    y: 540,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Emprunte SHA256 du document :`, {
    x: 70,
    y: 510,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(documentHash, {
    x: 200,
    y: 510,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  // Footer
  page.drawText('Ce certificat a été généré automatiquement et atteste de l\'intégrité du document.', {
    x: 70,
    y: 100,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
 
  const pdfBytes = await pdfDoc.save();
  console.log(`Certificat généré pour ${documentHash}`);
  
  return pdfBytes;
}
