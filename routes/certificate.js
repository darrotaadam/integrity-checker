import { Router } from 'express';
const router = Router();

import { generateCertificate } from '../services/certificate.js';
import { BlockchainWrapper } from '../services/blockchain.js';


router.post('/certificate', async (req, res) => {
    try {
        const { fileName, signerAddress, documentHash } = req.body;
        
        const blockchain = new BlockchainWrapper("IntegrityChecker");
 
        // on utilise le compte de l'utilisateur
        blockchain.accounts = [signerAddress];

        const signature = await blockchain.getSignature(documentHash, signerAddress);
        if( !signature){
            throw new Error("Impossible de trouver la signature correspondante");
        }

        const signatureTimestamp = signature.timestamp;
        const signDate = new Date(Number(signatureTimestamp)*1000).toUTCString();
        const contractAddress = blockchain.contractJson.address.toLowerCase();
        
        const pdfBytes = await generateCertificate({
            fileName,
            signDate,
            signerAddress,
            documentHash,
            contractAddress
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la génération du certificat' +  error.message );
    }
});

export default router;








