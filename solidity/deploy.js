const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');

const web3 = new Web3(`http://${process.env.BLOCKCHAIN_NETWORK_HOST}:${process.env.BLOCKCHAIN_NETWORK_PORT}/`);
console.log(`[*] Connecté au réseau blockchain ${process.env.BLOCKCHAIN_NETWORK_HOST}:${process.env.BLOCKCHAIN_NETWORK_PORT}`)
const compteDeploiement = process.env.DEPLOY_ACCOUNT;
const contractName = 'IntegrityChecker';
const bytecodePath = path.join(__dirname, `${contractName}.bin`);
const bytecode = fs.readFileSync(bytecodePath, 'utf8');

const abi = require(`./${contractName}abi.json`);
const myContract = new web3.eth.Contract(abi);
myContract.handleRevert = true;

async function deploy() {
//	const providersAccounts = await web3.eth.getAccounts();

	console.log('Compte de déploiement:', compteDeploiement);

	const contractDeployer = myContract.deploy({
		data: '0x' + bytecode,
		arguments: [1],
	});

	const gas = await contractDeployer.estimateGas({
		from: compteDeploiement,
	});
	console.log('Estimated gas:', gas);

	try {
		const tx = await contractDeployer.send({
			from: compteDeploiement,
			gas,
			gasPrice: 10000000000,
		});
		console.log('Contrat deployé à l\'addresse: ' + tx.options.address);

		const deployedAddressPath = path.join(__dirname, `${contractName}.txt`);
		fs.writeFileSync(deployedAddressPath, tx.options.address);

		const publicContractPath = path.join(__dirname, `../public/contracts/${contractName}.json`);
		const publicContractJson = JSON.parse(fs.readFileSync(publicContractPath));
		publicContractJson.address = tx.options.address;
		fs.writeFileSync(publicContractPath, JSON.stringify(publicContractJson, null, '\t'));
		console.log(`[*]Adresse située dans le fichier ${publicContractPath}`);

	} catch (error) {
		console.error(error);
	}
}

deploy();