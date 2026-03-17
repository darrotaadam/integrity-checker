const express = require('express');
const cors = require('cors');
import { generateCertificate } from './certificate';


const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-certificate', async (req, res) => {
    try {
        const { fileName, signDate, signerAddress, documentHash } = req.body;
        const pdfBytes = await generateCertificate({
            fileName,
            signDate,
            signerAddress,
            documentHash
        });
        res.contentType('application/pdf');
        res.send(pdfBytes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la génération du certificat');
    }
});

app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
