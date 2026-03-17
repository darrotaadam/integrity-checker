const { Web3 } = require('web3');

const web3 = new Web3("http://localhost:7546")
const path = require('path');
const fs = require('fs');
const { createHash } = require('crypto');

web3.eth.getBlockNumber().then(console.log);

web3.eth.getAccounts().then(console.log)


const contractName = 'IntegrityChecker';


const fileName = `${contractName}.sol`;
const contractPath = path.join(__dirname, fileName);
const sourceCode = fs.readFileSync(contractPath, 'utf8');


const abi = require(`./${contractName}abi.json`);
const deployedAddressPath = path.join(__dirname, `${contractName}.txt`);
const deployedAddress = fs.readFileSync(deployedAddressPath, 'utf8');
console.log(`Using contract ${deployedAddress}`);
const myContract = new web3.eth.Contract(abi, deployedAddress);
myContract.handleRevert = true;

async function interact() {
	const accounts = await web3.eth.getAccounts();
	const defaultAccount = accounts[0];

	try {
		// Get the current value of my number
	
        
        let hash = "0x" + createHash('sha256').update(sourceCode).digest('hex');
        console.log(`[*] Hash of source code from file ${fileName} : ${hash}` )
			
		// Increment my number
		const receipt = await myContract.methods.addSignature(hash).send({
		 	from: defaultAccount,
		 	gas: 1000000,
		 	gasPrice: '10000000000',
		 });
		console.log('Transaction Hash: ' + receipt.transactionHash);

       	
        
        const signatures = await myContract.methods.getSignatures(hash).call();
        //console.log(signatures);
        for (let signature of signatures){
            console.log(signature);
        }


		// Get the updated value of my number
		//const myNumberUpdated = await myContract.methods.myNumber().call();
		//console.log('myNumber updated value: ' + myNumberUpdated);
	} catch (error) {
		console.error(error);
	}
}

interact();