
class BlockChain {
    constructor() {
        this.web3 = new Web3(window.ethereum);
        window.ethereum.request({ method: "eth_requestAccounts" });
        this.accounts = null;
        console.log(this.accounts);
        this.contract = null;
        this.contractName = null;
        this.fetcher = new Fetcher();
        console.log(this);
    }
    isMetaMask() {
        return window.ethereum.isMéetaMask;
    }
    async getChainId() {
        return await web3.eth.getChainId();
    }
    async getBlockNumber() {
        return await web3.eth.getBlockNumber();
    }
    async initAccount() {
        this.accounts = await this.web3.eth.getAccounts().then((accounts) => { return accounts; });
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
        this.contractName = contractName;
        const contractInfos = await this.fetcher.fetchContract(contractName);
        console.log("[*] Contract fetched", contractInfos);
        this.contract = new this.web3.eth.Contract(contractInfos.abi, contractInfos.address);
    }
    async addSignature(hash) {
        return this.contract.methods.addSignature(hash).send({
            from: this.accounts[0],
            gas: 1000000,
            gasPrice: '10000000000'
        });
    }


    async verifySignature(hash){
        return await this.contract.methods.getSignatures(hash).call({
            from: this.accounts[0],
            gas: 1000000,
            gasPrice: '10000000000'
        });
    }



}












