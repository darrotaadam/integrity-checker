
console.log("index.js");




const BLOCKCHAIN = new BlockChain();

BLOCKCHAIN.initAccount();

BLOCKCHAIN.setContract("IntegrityChecker");

document.getElementById("form-sign").addEventListener("submit", async (e) => {
    e.preventDefault();
    if( !BLOCKCHAIN.accounts){
        await BLOCKCHAIN.initAccount();
    }
    const HASH = await getHashOfDoc(e.target.files.files);
    console.log(HASH);
    const result = BLOCKCHAIN.addSignature(HASH);
    console.log(result);
    //BLOCKCHAIN.fetcher.fetchPdfAjax(BLOCKCHAIN.contractName, BLOCKCHAIN.accounts[0]);

    return false;
});


document.getElementById("form-verify").addEventListener("submit", async(e)=>{
    e.preventDefault();
    if( !BLOCKCHAIN.accounts){
        await BLOCKCHAIN.initAccount();
    }
    const HASH = await getHashOfDoc(e.target.files.files);
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
                <p>${new Date(Number(result[i].timestamp))}</p>
                </br>
            </div>
            `;
        }
    }

    return false;
});




if (window.ethereum) {
    

} else {
    // no Ethereum provider - instruct user to install MetaMask
    document.getElementById('warn').innerHTML =
        "Please <a href='https://metamask.io/download/'>install MetaMask</a>.";
}