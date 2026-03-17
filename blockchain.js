
export class BlockchainWrapper{

    constructor(contractName){
        this.web3 = require('Web3');

        const abi = require(`./browser/${contractName}abi.json`);
        const deployedAddressPath = path.join(__dirname, `/browser/${contractName}.txt`);
        const deployedAddress = fs.readFileSync(deployedAddressPath, 'utf8');
        
        this.contract = new web3.eth.Contract(abi, deployedAddress);
    }


    async getTimestamp(blockHash){
        return await this.contract.methods.getBlock(blockHash);
    }


    async verifySignature(hash){
        return await this.contract.methods.getSignatures(hash).call({
            from: this.accounts[0],
            gas: 1000000,
            gasPrice: '10000000000'
        });
    }


}

