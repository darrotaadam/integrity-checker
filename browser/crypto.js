/**
 * 
 * @param {FileList} files 
 */
function getHashOfDoc(files){
    console.log(files);

    return new Promise((resolve, reject) => {
        const FILE = files[0]; // normalement un seul doc dans le formulaire
        const reader = new FileReader();
        

        reader.onload = async () => {
            try{
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", reader.result);
            const hashHex = [...new Uint8Array(hashBuffer)]
                .map(x => x.toString(16).padStart(2, '0'))
                .join('');

            console.log("Hash:", hashHex);
            console.log("Ethereum format:", "0x" + hashHex);
            resolve("0x" + hashHex);
            }
            catch(e){
                reject(e);
            }
        }
        reader.error = reject;
        reader.readAsArrayBuffer(FILE);
    });

}