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




function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}