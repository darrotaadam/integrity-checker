
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


document.getElementById("i-have-cert").addEventListener('change', (e)=>{
    document.getElementById("verify-result").innerHTML = "";
    const CERT_INPUT = document.getElementById("cert-verify-input"); 
    CERT_INPUT.required = e.target.checked;
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



document.getElementById("file-verify-input").addEventListener("change", async (e)=>{
    e.preventDefault();

    document.getElementById('verify-result').innerHTML = "";
    if( !BLOCKCHAIN.accounts){
        console.log("initAccount()");
        await BLOCKCHAIN.initAccount();
    }
    console.log(BLOCKCHAIN.accounts);
    
    const verify_result = document.getElementById("verify-result");


    const FILE = e.target.files[0];
    const CERT_CHECK =  document.getElementById("i-have-cert");

    if( !FILE ){
        verify_result.innerHTML = "<p>Veuillez sélectionner un fichier</p>";
        throw new Error("No file selected");
    }
    const HASH = await getHashOfDoc(FILE);
    console.log(HASH);

    const signatures = await BLOCKCHAIN.verifySignature(HASH);

    console.log(signatures);

    if( CERT_CHECK.checked ){
        //Si il ya un certificat: on l'utilise et récupère le hash et l'adresse du signataire
        //Deja si le hash du certif ne correspond pas au hash du fichier on balance la première erreur
        //ensuite si ils correspondent on va chercher la liste des signatures ayant le signataire du certif
        //si on trouve rien c'est incohérent : on met une erreur
        //-> Si OK alors on met que le certfif valide bien l'intégrité du fichier présent 
        const CERT = document.getElementById("cert-verify-input").files[0]; 
    
        if( !CERT ){
            verify_result.innerHTML = "<p>Si vous souhaitez utiliser un certificat, veuillez l'importer dans le champ dédié.</p>";
            throw new Error("No cert selected");
        }
        

        const certBytes = await readFileAsArrayBuffer(CERT);
        console.log(certBytes);
        const pdfDoc = await PDFLib.PDFDocument.load(certBytes);

        const subject = pdfDoc.getKeywords();

        const data = JSON.parse(subject);

        console.log(data.documentHash);
        
        const CERT_HASH = data.documentHash;
        const CERT_CONTRACT_ADDR = data.contractAddress;
        const CERT_SIGNATAIRE_ADDR = data.signerAddress;

        // le certif ne contient pas de hash valide
        if(! CERT_HASH){
            verify_result.innerHTML = "<p>Ce certificat ne semble pas contenir d'emprunte identifiable.</p>";
            throw new Error("Hash not found in document");
        }

        // les contrats (abi et certif) ne correspondent pas
        if( CERT_CONTRACT_ADDR.toLowerCase() !== BLOCKCHAIN.contractInfos.address.toLowerCase() ){
            console.log(CERT_CONTRACT_ADDR.toLowerCase(), BLOCKCHAIN.contractInfos.address.toLowerCase());
            verify_result.innerHTML = "<p>Les adresses des contrats ne correspondent pas : le certificat a peut-être été délivré pour un contrat différent ?</p>";
            throw new Error("Contract addresses not matching : certificate was probably delivered for an other contract.");
        }
                
        // le fichier n'a pas été signé dans la blockchain
        if(signatures.length <= 0){
            verify_result.innerHTML = "<p>Le fichier soumis n'est pas inscrit dans la blockchain.</p>";
            throw new Error("File is not in blockchain");
        }

        let signatureCorrespondantAuCertif = null;
        for(let i=0; i<signatures.length; i++){
            if(signatures[i].signataire.toLowerCase() === CERT_SIGNATAIRE_ADDR.toLowerCase() ){
                signatureCorrespondantAuCertif = signatures[i];
            }
        }

        //le fichier a été signé, mais pas par le signataire du contrat
        if ( !signatureCorrespondantAuCertif ){
            verify_result.innerHTML = "<p>Le signataire du certificat ne fait pas partie des signataires de ce fichier.</p>";
            
            // on met le tableau des signatures quand même
            verify_result.innerHTML = "<h2>Signatures</h2>"
            const table = document.createElement("table")
            table.classList.add("table","table-dark");
            table.innerHTML += `<thead>
            <tr>
            <th scope="col">#</th>
            <th scope="col">Adresse - Signataire</th>
            <th scope="col">Date - Signature</th>
            </tr>
            </thead>`;
            
            const tbody = document.createElement("tbody");
            
            for(let i=0; i<signatures.length; i++){
                let tr = document.createElement("tr");
                tr.innerHTML += `
                <tr>
                    <th scope="row">${i+1}</th>
                    <td>${signatures[i].signataire}</td>
                    <td>${new Date(Number(signatures[i].timestamp)*1000)}</td>
                </tr>
                `;
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            verify_result.appendChild(table);

            throw new Error("Certificate deliverer did not sign this file");
        }


        verify_result.innerHTML = `<div>
                <h4>Le certificat fourni atteste bien de la signature du fichier présent par :</h2>
                <p>${signatureCorrespondantAuCertif.signataire}</p>
                </br>
            </div>
            <div>
                <h4>Date de signature</h2>
                <p>${new Date(Number(signatureCorrespondantAuCertif.timestamp)*1000)}</p>
                </br>
            </div>`;


    }
    // si on a pas de certif alors on affiche une table avec la liste des signatures du fichier
    else{

        

        if( signatures.length <= 0){
            verify_result.innerHTML = "<p>Le fichier soumis n'est pas inscrit dans la blockchain.</p>";
            throw new Error("File is not in blockchain");
        }
        else{
            verify_result.innerHTML = "<h2>Signatures</h2>"
            const table = document.createElement("table")
            table.classList.add("table","table-dark");
            table.innerHTML += `<thead>
            <tr>
            <th scope="col">#</th>
            <th scope="col">Adresse - Signataire</th>
            <th scope="col">Date - Signature</th>
            </tr>
            </thead>`;
            
            const tbody = document.createElement("tbody");
            
            for(let i=0; i<signatures.length; i++){
                let tr = document.createElement("tr");
                tr.innerHTML += `
                <tr>
                    <th scope="row">${i+1}</th>
                    <td>${signatures[i].signataire}</td>
                    <td>${new Date(Number(signatures[i].timestamp)*1000)}</td>
                </tr>
                `;
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            verify_result.appendChild(table);
        }
    }

    

    
    
    

    return false;
});


