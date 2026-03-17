
export function BlockChain(){
    this.web3 = new Web3(window.ethereum);
    window.ethereum.request({ method: "eth_requestAccounts" });
    this.accounts = this.web3.eth.getAccounts();
    this.IntegrityCheckerContract = 
}

BlockChain.prototype.isMetaMask = () => {
    return window.ethereum.isMetaMask;
}

BlockChain.prototype.getChainId = async () => {
    return await web3.eth.getChainId();
}

BlockChain.prototype.getBlockNumber = async () => {
    return await web3.eth.getBlockNumber();
}

BlockChain.prototype.onNewBlock = (block) => {
    console.log(block);
}

BlockChain.prototype.subscribeToBlocksChange = async () => {
    const blockSubscription = await this.web3.eth.subscribe('newBlockHeaders');
    blockSubscription.on('data', block => {
        this.onNewBlock(block);
    });
}

BlockChain.prototype.addSignature = async (hash) => {
    return await this.IntegrityCheckerContract.methods.addSignature(hash).send({
        from: this.accounts[0],
        gas: 1000000,
        gasPrice: '10000000000',
    });
}



