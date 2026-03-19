
class BlockChain {
    constructor() {
        this.web3 = new Web3(window.ethereum);
        this.contractInfos = null;
        this.accounts = null;
        this.contract = null;
        this.contractName = null;
        this.fetcher = new Fetcher();
        this.blockSubscription = null;
        console.log(this);
        this.onNewBlock = null;
    }
    isMetaMask() {
        return window.ethereum.isMetaMask;
    }

    setOnNewBlockCallback(onNewBlock){
        this.onNewBlock = onNewBlock;
    }

    async getChainId() {
        return await this.web3.eth.getChainId();
    }
    async getBlockNumber() {
        return await this.web3.eth.getBlockNumber();
    }
    async initAccount() {
        this.accounts =await window.ethereum.request({ method: "eth_requestAccounts" });
    }
    async getBlock(blockNumber){
        return await this.web3.eth.getBlock(blockNumber);
    }

    
    async subscribeToBlocksChange() {
        this.blockSubscription = await this.web3.eth.subscribe('newBlockHeaders');
        this.blockSubscription.on('data', block => {
            if (this.onNewBlock){
                this.onNewBlock(block);
            }
        });
    }
    async setContract(contractName) {
        console.log("Blockain state : ", this);
        this.contractName = contractName;
        this.contractInfos = await this.fetcher.fetchContract(contractName);
        console.log("[*] Contract fetched", this.contractInfos);
        this.contract = new this.web3.eth.Contract(this.contractInfos.abi, this.contractInfos.address);
    }
    async addSignature(hash) {
        console.log("Blockain state : ", this);
        return this.contract.methods.addSignature(hash).send({
            from: this.accounts[0],
        });
    }   


    async verifySignature(hash){
        console.log("Blockain state : ", this);
        return await this.contract.methods.getSignatures(hash).call({
            from: this.accounts[0],
        });
    }

    async hasAddrAlreadySigned(hash){
        console.log("Blockain state : ", this);
        return await this.contract.methods.hasAddrAlreadySigned(hash).call({
            from: this.accounts[0],
        });
    }



}












