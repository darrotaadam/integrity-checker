
async function fetchPdfAjax(fileName, signerAddress, documentHash){
    const response = await fetch('/generate-certificate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        fileName: file.name,
        signDate: new Date().toLocaleDateString(),
        signerAddress: (await web3.eth.getAccounts())[0],
        documentHash: HASH
    })
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `certificat_${file.name}.pdf`;
a.click();

}




async function fetchContract(contractName){
    const response = await fetchContract(`/${contractName}.json`, {
        headers : {
            "Content-Type" : "application/json"
        }
    });

    console.log(response);
}