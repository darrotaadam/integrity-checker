import { BlockChain } from "./blockchain"; 

console.log("index.js");



const BLOCKCHAIN = new BlockChain();


document.getElementById("form-sign").addEventListener("submit", (e) => {
    e.preventDefault();
    const HASH = getHashOfDoc(e.target.files.files);
    return false;

});





if (window.ethereum) {
    // use the injected Ethereum provider to initialize Web3.js
    const web3 = new Web3(window.ethereum);
    window.ethereum.request({ method: "eth_requestAccounts" });
    
    web3.eth.getAccounts().then((r)=>{
        console.log(r);
        document.getElementById("header-right").innerText = `Connecté avec l'adresse ${r[0]}`;
    });

    // check if Ethereum provider comes from MetaMask
    if (window.ethereum.isMetaMask) {
        document.getElementById('provider').innerText =
            'Connected to Ethereum with MetaMask.';
    } else {
        document.getElementById('provider').innerText =
            'Non-MetaMask Ethereum provider detected.';
    }

    // get chain ID and populate placeholder
    document.getElementById(
        'chainId',
    ).innerText = `Chain ID: ${await web3.eth.getChainId()} `;
    // get latest block and populate placeholder
    document.getElementById(
        'latestBlock',
    ).innerText = `Latest Block: ${await web3.eth.getBlockNumber()}`;



    // subscribe to new blocks and update UI when a new block is created
    const blockSubscription = await web3.eth.subscribe('newBlockHeaders');
    blockSubscription.on('data', block => {
        document.getElementById(
            'latestBlock',
        ).innerText = `Latest Block: ${block.number}`;

    });



} else {
    // no Ethereum provider - instruct user to install MetaMask
    document.getElementById('warn').innerHTML =
        "Please <a href='https://metamask.io/download/'>install MetaMask</a>.";
}