import { Web3 } from 'web3';
import  fs  from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BlockchainWrapper{

    constructor(contractName){
        this.web3 = new Web3('http://localhost:7545');
        this.accounts = null;

        this.contractJson = JSON.parse(
            fs.readFileSync(path.join(__dirname,`../public/contracts/${contractName}.json`), 'utf8')
        );

        
        const abi = this.contractJson.abi;
        const deployedAddress = this.contractJson.address;
        
        this.contract = new this.web3.eth.Contract(abi, deployedAddress);
    }


    async initAccount() {
        this.accounts = await this.web3.eth.getAccounts().then((accounts) => { return accounts; });
    }

    async getTimestamp(blockHash){
        return await this.contract.methods.getBlock(blockHash).call({
            from: this.accounts[0]
    });
    }


    async verifySignature(hash){
        return await this.contract.methods.getSignatures(hash).call({
            from: this.accounts[0]
        });
    }


}

