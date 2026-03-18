
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
    document.getElementById("latestBlock-hash").innerText = block.hash;
});
await BLOCKCHAIN.setContract("IntegrityChecker");

BLOCKCHAIN.onNewBlock(await BLOCKCHAIN.getBlock( await BLOCKCHAIN.getBlockNumber()));

BLOCKCHAIN.subscribeToBlocksChange();

document.getElementById("form-sign").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    document.getElementById('sign-result').innerHTML = "";
    
    if( !BLOCKCHAIN.accounts){
        await BLOCKCHAIN.initAccount();
    }

    const FILE = e.target.files.files[0];
    if( !FILE ){
        throw new Error("No files selected");
    }
    const HASH = await getHashOfDoc(FILE);
    console.log(HASH);
    
    const hasAddrAlreadySigned = await BLOCKCHAIN.hasAddrAlreadySigned(HASH);
    console.log("hasAddrAlreadySigned : ", hasAddrAlreadySigned);
    if(hasAddrAlreadySigned === true){
        document.getElementById('sign-result').innerHTML = `<p><h2>Le document a déjà été signé avec l'adresse utilisée:</h2>
        <br>
        <strong>${BLOCKCHAIN.accounts[0]}</strong>
        <hr>
        Emprunte correspondante :
        <br>
        <strong>${HASH}</strong>
        <p>`;
        throw new Error("User has already signed");
    } 
    

    const receipt = await BLOCKCHAIN.addSignature(HASH);
    console.log(receipt)
    const result = receipt.events.addSignatureResult;

        
    switch (Number(result.returnValues.code)){
        case CODES.OK: {
                document.getElementById('sign-result').innerHTML = `<p><h2>Document signé avec succès</h2>
                <br>
                <hr>
                Emprunte correspondante :
                <br>
                <strong>${HASH}</strong>
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


document.getElementById("file-verify-input").addEventListener("change", async (e)=>{
    e.preventDefault();

    document.getElementById('verify-result').innerHTML = "";
    if( !BLOCKCHAIN.accounts){
        console.log("initAccount()");
        await BLOCKCHAIN.initAccount();
    }
    console.log(BLOCKCHAIN.accounts);
    
    const FILE = e.target.files[0];
    
    
    if( !FILE ){
        throw new Error("No files selected");
    }
    const HASH = await getHashOfDoc(FILE);
    console.log(HASH);

    
    
    const result = await BLOCKCHAIN.verifySignature(HASH);
    console.log(result);

    const verify_result = document.getElementById("verify-result");

    if( result.length <= 0){
        verify_result.innerHTML = "<p>Document Non Reconnu.</p>";
    }
    else{
        verify_result.innerHTML = "<h2>Signatures</h2>"        
        for(let i=0; i<result.length; i++){
            verify_result.innerHTML += `
            <div>
                <h4>Signataire</h2>
                <p>${result[i].signataire}</p>
                </br>
            </div>
            <div>
                <h4>Date de signature</h2>
                <p>${new Date(Number(result[i].timestamp)*1000)}</p>
                </br>
            </div>
            `;
        }
    }

    return false;
});





document.getElementById("cert-verify-input").addEventListener("change", async (e)=>{
    e.preventDefault();
    
    const verify_result = document.getElementById("verify-result"); 

    verify_result.innerHTML = "";
    if( !BLOCKCHAIN.accounts){
        console.log("initAccount()");
        await BLOCKCHAIN.initAccount();
    }
    console.log(BLOCKCHAIN.accounts);
    
    const CERT = e.target.files[0];
    
    if( !CERT ){
        throw new Error("No files selected");
    }
    
  
    const certBytes = await readFileAsArrayBuffer(CERT);
    console.log(certBytes);
    const pdfDoc = await PDFLib.PDFDocument.load(certBytes);

    const subject = pdfDoc.getKeywords();


    const data = JSON.parse(subject);

    console.log(data.documentHash);
    
    const HASH = data.documentHash;
    
    if(! HASH){
        verify_result.innerHTML = "<p>Ce certificat ne semble pas contenir d'emprunte identifiable.</p>";
        throw new Error("Hash not found in document");
    }
    

    const CERT_CONTRACT_ADDR = data.contractAddress;
    if( CERT_CONTRACT_ADDR.toLowerCase() !== BLOCKCHAIN.contractInfos.address.toLowerCase() ){
        console.log(CERT_CONTRACT_ADDR.toLowerCase(), BLOCKCHAIN.contractInfos.address.toLowerCase());
        verify_result.innerHTML = "<p>Les adresses des contrats ne correspondent pas : le certificat a peut-être été délivré pour un contrat différent ?</p>";
        throw new Error("Contract addresses not matching : certificate was probably delivered for an other contract.");
    }


    const result = await BLOCKCHAIN.verifySignature(HASH);
    console.log(result);

    if( result.length <= 0){
        verify_result.innerHTML = "<p>Aucune signature présente dans la blockchain ne correspond à ce certificat.</p>";
    }
    else{
        verify_result.innerHTML = "<h2>Ce certificat est authentique</h2>"        
        for(let i=0; i<result.length; i++){
            verify_result.innerHTML += `
            <div>
                <h4>Signataire</h2>
                <p>${result[i].signataire}</p>
                </br>
            </div>
            <div>
                <h4>Date de signature</h2>
                <p>${new Date(Number(result[i].timestamp)*1000)}</p>
                </br>
            </div>
            `;
        }
    }

    return false;
});
