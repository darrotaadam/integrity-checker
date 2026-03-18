import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';


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
  

  const HEIGHT_OFFSET = 50;
  
  const BORDER_WIDTH = 2;

  // Draw a nice background rectangle
  page.drawRectangle({
    x: 50,
    y: 650 - HEIGHT_OFFSET,
    width: width - 100,
    height: 100 - BORDER_WIDTH,
    borderWidth: BORDER_WIDTH,
    borderColor: rgb(0.2, 0.4, 0.8),
    color: rgb(0.95, 0.95, 1),
  });

  
  page.drawText('CERTIFICAT DE SIGNATURE', {
    
    x:  (width/2) - (helveticaBold.widthOfTextAtSize('CERTIFICAT DE SIGNATURE', 24)/2)  ,  // mal centré , a régler
    y: 700 - HEIGHT_OFFSET,
    size: 24,
    font: helveticaBold,
    color: rgb(0.2, 0.4, 0.8),
  });

  // Subtitle
  page.drawText('Ce document atteste de l\'authenticité et de l\'intégrité du fichier signé.', {
    x: 70,
    y: 670 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Document info
  page.drawText(`Nom du fichier :`, {
    x: 70,
    y: 600 - HEIGHT_OFFSET,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(fileName, {
    x: 75,
    y: 580 - HEIGHT_OFFSET ,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Date de signature :`, {
    x: 70,
    y: 550 - HEIGHT_OFFSET,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(signDate, {
    x: 75,
    y: 530 - HEIGHT_OFFSET,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Adresse du signataire :`, {
    x: 70,
    y: 500 - HEIGHT_OFFSET,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(signerAddress, {
    x: 75,
    y: 480 - HEIGHT_OFFSET,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Emprunte SHA256 du document :`, {
    x: 70,
    y: 450 - HEIGHT_OFFSET,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(documentHash, {
    x: 75,
    y: 430 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  // Footer
  page.drawText('Ce certificat a été généré automatiquement et atteste de l\'intégrité du document.', {
    x: 70,
    y: 100 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
 
  const pdfBytes = await pdfDoc.save();
  console.log(`Certificat généré pour ${documentHash}`);
  
  return pdfBytes;
}
