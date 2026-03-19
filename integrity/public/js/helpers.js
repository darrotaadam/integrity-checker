function shortAddr(addr, firstchars=6) {
    return addr.slice(0, firstchars) + "..." + addr.slice(-4);
}

/**
 * 
 * @param {File} FILE 
 */
function getHashOfDoc(FILE){
    console.log(FILE);

    return new Promise((resolve, reject) => {
        
        const reader = new FileReader();
        
        reader.onload = async () => {
            try{
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", reader.result);
            const hashHex = [...new Uint8Array(hashBuffer)]
                .map(x => x.toString(16).padStart(2, '0'))
                .join('');

            resolve("0x" + hashHex.toLowerCase());
            }
            catch(e){
                reject(e);
            }
        }
        reader.error = reject;
        reader.readAsArrayBuffer(FILE);
    });

}




function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}


/**
 * 
 * @param {Array<Object>} signatures 
 */
function showSignaturesTable(signatures){
    const verify_result = document.getElementById("verify-result");
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
            <td><button type="button" class="btn btn-outline-secondary clickable" data-copy="${signatures[i].signataire}" >${shortAddr(signatures[i].signataire)}</button></td>
            <td>${new Date(Number(signatures[i].timestamp)*1000)}</td>
        </tr>
        `;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    verify_result.appendChild(table);

}


/**
 * 
 * @param {Array<Object>} signatures 
 */
function createSignaturesTable(signatures){
    

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
            <td><button type="button" class="btn btn-outline-secondary clickable" data-copy="${signatures[i].signataire}" >${shortAddr(signatures[i].signataire)}</button></td>
            <td>${new Date(Number(signatures[i].timestamp)*1000)}</td>
        </tr>
        `;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;

}




function showVerifyError(msg) {
    document.getElementById("verify-result").innerHTML = `<p class="text-warning">${msg}</p>`;
}

function showSignError(msg) {
    document.getElementById("sign-result").innerHTML = `<p class="text-warning">${msg}</p>`;
}

function showValidCertificate(sig) {
    document.getElementById("verify-result").innerHTML = `<h2 class="text-success">Certificat valide</h2>`;
    document.getElementById("verify-result").appendChild(createSignaturesTable([sig]));
}
