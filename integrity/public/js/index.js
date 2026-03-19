
console.log("index.js");


const BLOCKCHAIN = new BlockChain();


const CODES = {
    OK : 0,
    ALREADY_SIGNED : 8
}

BLOCKCHAIN.setOnNewBlockCallback( (block)=>{
    console.log("[*] NEW BLOCK : ",block);
    document.getElementById("latestBlock-number").innerText = block.number;
    document.getElementById("latestBlock-nonce").innerText = block.nonce;
    document.getElementById("latestBlock-hash").innerHTML = `<button type="button" class="btn btn-outline-secondary clickable" data-copy="${block.hash}" >${shortAddr(block.hash, 24)}</button>`;
});
await BLOCKCHAIN.setContract("IntegrityChecker");

BLOCKCHAIN.onNewBlock(await BLOCKCHAIN.getBlock( await BLOCKCHAIN.getBlockNumber()));

BLOCKCHAIN.subscribeToBlocksChange();


/**
 * 
 * @returns {Object}
 */
function getVerifyState() {
    return {
        hasCert: document.getElementById("i-have-cert").checked,
        file: document.getElementById("file-verify-input").files[0],
        cert: document.getElementById("cert-verify-input").files[0]
    };
}

/**
 * 
 * @param {Event} e 
 * @returns 
 */
async function handleVerification(e) {
    e.preventDefault();

    document.getElementById('verify-result').innerHTML = "";
    if( !BLOCKCHAIN.accounts){
        console.log("initAccount()");
        await BLOCKCHAIN.initAccount();
    }

    const state = getVerifyState();

    if (!state.file) {
        return showVerifyError("Veuillez sélectionner un fichier");
    }

    const hash = await getHashOfDoc(state.file);
    const signatures = await BLOCKCHAIN.verifySignature(hash);

    if (state.hasCert) {
        return handleWithCertificate(state, hash, signatures);
    } else {
        return handleWithoutCertificate(signatures);
    }
}

/**
 * 
 * @param {Array<Object>} signatures 
 * @returns
 */
function handleWithoutCertificate(signatures) {
    if (signatures.length === 0) {
        return showVerifyError("Document non reconnu");
    }

    return showSignaturesTable(signatures);
}

/**
 * 
 * @param {Object} state 
 * @param {String} hash 
 * @param {Array<Object>} signatures 
 * @returns 
 */
async function handleWithCertificate(state, hash, signatures) {
    
    if (!state.cert) {
        return showVerifyError("Si vous souhaitez utiliser un certificat, veuillez l'importer dans le champ dédié.");
    }

    const certData = await extractCertData(state.cert);

     // le certif ne contient pas de hash valide
    if (certData.documentHash !== hash) {
        return showVerifyError("Le certificat ne correspond pas au fichier");
    }

    // les contrats (abi et certif) ne correspondent pas
    if (certData.contractAddress.toLowerCase() !== BLOCKCHAIN.contractInfos.address.toLowerCase()) {
        return showVerifyError("Certificat lié à un autre contrat");
    }

    // le fichier n'a pas été signé dans la blockchain
    if (signatures.length === 0) {
        return showVerifyError("Document non enregistré sur la blockchain");
    }

    const sig = signatures.find(s => // normalement il ne devrait y avoir qu'une seule signature par hash et addresse ; sinon c'est que le contrat lui même est pété
        s.signataire.toLowerCase() === certData.signerAddress.toLowerCase()
    );
    
    //le fichier a été signé, mais pas par le signataire du contrat
    if (!sig) {
        showSignaturesTable(signatures);
        return showVerifyError("Le signataire du certificat n'a pas signé ce document");
    }

    return showValidCertificate(sig);
}


/**
 * 
 * @param {File} certFile 
 * @returns {Object}
 */
async function extractCertData(certFile) {
    const bytes = await readFileAsArrayBuffer(certFile);
    const pdfDoc = await PDFLib.PDFDocument.load(bytes);

    const keywords = pdfDoc.getKeywords();

    if ( !keywords ) {
        showVerifyError("Certificat invalide");
        throw new Error("Certificat invalide");
    }

    try {
        return JSON.parse(keywords);
    } catch(e){
        showVerifyError("Certificat invalide");
        throw new Error("Certificat invalide");
    }
}







document.getElementById("file-verify-input")
    .addEventListener("change", handleVerification);

document.getElementById("cert-verify-input")
    .addEventListener("change", handleVerification);

document.getElementById("i-have-cert")
    .addEventListener("change", handleVerification);



document.getElementById("file-sign-input").addEventListener("change", async (e) => {
    document.getElementById('sign-result').innerHTML = "";
});


const signMessage = document.getElementById('sign-result');
const signMessageObserver = new MutationObserver(()=>{
    if (signMessage.childElementCount === 0){
        console.log("sign empty");
        signMessage.closest('.card').classList.add("d-none");
    }else{
        console.log("sign not empty");
        signMessage.closest('.card').classList.remove("d-none");
    }
}); 
signMessageObserver.observe(signMessage, { childList: true, subtree: true })

const verifyMessage = document.getElementById('verify-result');
const verifyMessageObserver = new MutationObserver(()=>{
    if (verifyMessage.childElementCount === 0){
        console.log("sign empty");
        verifyMessage.closest('.card').classList.add("d-none");
    }else{
        console.log("sign not empty");
        verifyMessage.closest('.card').classList.remove("d-none");
    }
}); 
verifyMessageObserver.observe(verifyMessage, { childList: true, subtree: true })




document.getElementById("form-sign").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    document.getElementById('sign-result').innerHTML = "";
    
    if( !BLOCKCHAIN.accounts){
        await BLOCKCHAIN.initAccount();
    }

    const FILE = e.target.files.files[0];
    if( !FILE ){
        showSignError("Aucun fichier sélectionné");
        throw new Error("No files selected");
    }
    const HASH = await getHashOfDoc(FILE);
    console.log(HASH);
    
    const hasAddrAlreadySigned = await BLOCKCHAIN.hasAddrAlreadySigned(HASH);
    console.log("hasAddrAlreadySigned : ", hasAddrAlreadySigned);
    if(hasAddrAlreadySigned === true){
        document.getElementById('sign-result').innerHTML = `<p><h2 class="text-warning">Le document a déjà été signé avec l'adresse utilisée:</h2>
        <br>
        <table class="table table-dark">
            <thead>
                <tr>
                    <th scope="col">Adresse - Signataire </th>
                    <th scope="col">Emprunte - Document </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    
                    <td><button type="button" class="btn btn-outline-secondary clickable" data-copy="${BLOCKCHAIN.accounts[0]}" >${shortAddr(BLOCKCHAIN.accounts[0])}</button></td>
                    <td><button type="button" class="btn btn-outline-secondary clickable" data-copy="${HASH}" >${shortAddr(HASH)}</button></td>
                </tr>
            </tbody>
        </table>
        <p>`;
        throw new Error("User has already signed");
    } 
    


      

    const receipt = await BLOCKCHAIN.addSignature(HASH);
    console.log(receipt)
    const result = receipt.events.addSignatureResult;

        
    switch (Number(result.returnValues.code)){
        case CODES.OK: {
                document.getElementById('sign-result').innerHTML = `<p><h2 class="text-success">Document signé avec succès</h2>
                <br>
                <hr>
                Emprunte correspondante :
                <br>
                <button type="button" class="btn btn-outline-secondary clickable" data-copy="${HASH}" >${HASH}</button>
                <p>`;
                break;
            }
        default:
            break;
    }

    console.log(result);
    BLOCKCHAIN.fetcher.fetchPdfAjax(FILE, BLOCKCHAIN.accounts[0], HASH);

    return false;
});


document.getElementById("i-have-cert").addEventListener('change', (e)=>{
    document.getElementById("verify-result").innerHTML = "";
    const CERT_INPUT = document.getElementById("cert-verify-input"); 
    CERT_INPUT.required = e.target.checked;
});



document.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-copy]");
    if (!target) return;

    const value = target.dataset.copy;

    await navigator.clipboard.writeText(value);

    target.classList.add("gradient-success", "text-white");
    setTimeout(() => target.classList.remove("bg-gradient-success", "text-white"), 1000);
});


/* Synonpsis: 
    depot d'un fichier:
        si j'ai un certificat checké :
            si cert présent:
                => cherche signature correspondante au certif
            sinon:
                => bloque et indique qu'il faut fournir un certificat dans l'input associé
        sinon:
            => cherche toutes les signatures et les affiche dans une table
    
    depot d'un certif (implique: j'ai un certificat checké ):
        si fichier présent:
            => cherche signature correspondante au certif
        sinon:
            => cherche signature correspondant au certif / ne fait rien et demande de mettre un fichier

    coche/décoche j'ai un certificat:
        ====> affiche ce qu'il faut en fonction de quels input sont remplis


*/
