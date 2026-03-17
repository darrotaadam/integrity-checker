/**
 * 
 * @param {FileList} files 
 */
function getHashOfDoc(files){
    console.log(files);

    const FILE = files[0]; // normalement un seul doc dans le formulaire

    const reader = new FileReader();

    reader.readAsArrayBuffer(FILE);

    reader.onload = async () => {
        
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", reader.result);
        const hashHex = [...new Uint8Array(hashBuffer)]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');

        console.log("Hash:", hashHex);
        console.log("Ethereum format:", "0x" + hashHex);
    
    }

    return hashHex;
}