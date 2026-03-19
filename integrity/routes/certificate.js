import { Router } from 'express';
const router = Router();

import { generateCertificate } from '../services/certificate.js';
import { BlockchainWrapper } from '../services/blockchain.js';


router.post('/certificate', async (req, res) => {
    try {
        const { fileName, signerAddress, documentHash } = req.body;
        
        const blockchain = new BlockchainWrapper("IntegrityChecker");
        //await blockchain.initAccount();
        blockchain.accounts = [signerAddress];
        //console.log(blockchain.accounts);

        //console.log(await blockchain.verifySignature(documentHash));

        const signature = await blockchain.verifySignature(documentHash).then((sigs)=> {
            for(let sig of sigs){
                if(sig.signataire.toLowerCase() === signerAddress.toLowerCase()){
                    return sig;
                }
            }
        }); 

        console.log("signature => ", signature);
        const signatureTimestamp = signature.timestamp;
        console.log(signatureTimestamp);

        const signDate = new Date(Number(signatureTimestamp)*1000).toUTCString();
        console.log(signDate);
        console.log(blockchain.contractJson)
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
        res.status(500).send('Erreur lors de la génération du certificat' +  error.message + error.stack);
    }
});

export default router;