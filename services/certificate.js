import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';


export async function generateCertificate({
  fileName,
  signDate,
  signerAddress,
  documentHash,
  contractAddress
}) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  pdfDoc.setKeywords([
  JSON.stringify({
    documentHash,
    signerAddress,
    contractAddress: contractAddress
  })
]);
  
  const page = pdfDoc.addPage([550, 750]);
  const { width, height } = page.getSize();

  // polices standard car on peut avoir le facteur largeur/longeur pour calculer les décalages par rapport au nombre de caractères
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  

  const HEIGHT_OFFSET = 50;
  
  const BORDER_WIDTH = 2;

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


  page.drawText('Ce document atteste de l\'authenticité et de l\'intégrité du fichier signé.', {
    x: (width/2) - (helvetica.widthOfTextAtSize('Ce document atteste de l\'authenticité et de l\'intégrité du fichier signé.', 10)/2),
    y: 670 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  
  
  page.drawText(`Nom du fichier :`, {
    x: 70,
    y: 600 - HEIGHT_OFFSET,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  const safeFileName = fileName.replace(/[^\x00-\xFF]/g, '?'); // remplace les caractères non WinAnsi
  page.drawText(safeFileName, {
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

  page.drawText(`Adresse du Smart-Contract :`, {
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
  
  page.drawText(`Emprunte SHA256 du document :`, {
    x: 70,
    y: 390 - HEIGHT_OFFSET,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(documentHash, {
    x: 75,
    y: 370 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  
  page.drawText('Ce certificat a été généré automatiquement et atteste de l\'intégrité du fichier signé.', {
    x: (width/2) - (helvetica.widthOfTextAtSize('Ce certificat a été généré automatiquement et atteste de l\'intégrité du fichier signé.', 10)/2),
    y: 100 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
 

  page.drawText('[ Important ]! Ce certificat n\'est pas lui même signé en raison de l\'absence de chaine de certification.', {
    x: (width/2) - (helvetica.widthOfTextAtSize('[ Important ]! Ce certificat n\'est pas lui même signé en raison de l\'absence de chaine de certification.', 10)/2),
    y: 165 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Assurez vous d\'en avoir pris possession de façon fiable.', {
    x: (width/2) - (helvetica.widthOfTextAtSize('Assurez vous d\'en avoir pris possession de façon fiable.', 10)/2),
    y: 150 - HEIGHT_OFFSET,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  

  const pdfBytes = await pdfDoc.save();
  console.log(`Certificat généré pour ${documentHash}`);
  
  return pdfBytes;
}
