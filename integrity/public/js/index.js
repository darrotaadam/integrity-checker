
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


document.getElementById("form-verify").addEventListener("change", async (e)=>{
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

    //const signed = await BLOCKCHAIN.hasAddrAlreadySigned(HASH);
    //console.log("hasAddrAlreadySigned : ", signed);

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

