function  Fetcher(){
}


Fetcher.prototype.fetchPdfAjax = async (file, signerAddress, documentHash)=>{
    const response = await fetch('/certificate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        fileName: file.name,
        signerAddress: signerAddress,
        documentHash: documentHash
    })
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `certificat_${file.name}.pdf`;
a.click();

}




 Fetcher.prototype.fetchContract = async (contractName) => {
    try{
        const response = await fetch(`/contracts/${contractName}.json`, {
            headers : {
                "Content-Type" : "application/json"
            }
        });

        const json = await response.json();
        return json;
    }
    catch(e){
        console.log(e); 
        return {};
    }
}