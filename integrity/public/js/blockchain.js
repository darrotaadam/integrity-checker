
class BlockChain {
    constructor() {
        this.web3 = new Web3(window.ethereum);
        this.contractInfos = null;
        this.accounts = null;
        this.contract = null;
        this.contractName = null;
        this.fetcher = new Fetcher();
        console.log(this);
    }
    isMetaMask() {
        return window.ethereum.isMetaMask;
    }
    async getChainId() {
        return await web3.eth.getChainId();
    }
    async getBlockNumber() {
        return await web3.eth.getBlockNumber();
    }
    async initAccount() {
        this.accounts =await window.ethereum.request({ method: "eth_requestAccounts" });
    }
    onNewBlock(block) {
        console.log(block);
    }
    async subscribeToBlocksChange() {
        const blockSubscription = await this.web3.eth.subscribe('newBlockHeaders');
        blockSubscription.on('data', block => {
            this.onNewBlock(block);
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
            //gas: 1000000,
            //gasPrice: '10000000000'
        });
    }   


    async verifySignature(hash){
        console.log("Blockain state : ", this);
        return await this.contract.methods.getSignatures(hash).call({
            from: this.accounts[0],
            //gas: 1000000,
            //gasPrice: '10000000000'
        });
    }

    async hasAddrAlreadySigned(hash){
        console.log("Blockain state : ", this);
        return await this.contract.methods.hasAddrAlreadySigned(hash).call({
            from: this.accounts[0],
            //gas: 1000000,
            //gasPrice: '10000000000'
        });
    }



}












