const express = require('express');
const cors = require('cors');
import { generateCertificate } from './certificate';
import { BlockchainWrapper } from './blockchain';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/certificate', async (req, res) => {
    try {
        const { fileName, signerAddress, documentHash } = req.body;
        
        const blockchain = new BlockchainWrapper();

        const signatureTimestamp = await blockchain.verifySignature(documentHash).then((sigs)=> {
            for(let sig in sigs){
                if(sig.signataire === signerAddress){
                    return sig;
                }
            }
        }).timestamp; 

        console.log(signatureTimestamp);
        
        const dateSignature = new Date(Number(signatureTimestamp));

        const pdfBytes = await generateCertificate({
            fileName,
            dateSignature,
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
