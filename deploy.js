const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');

const web3 = new Web3('http://127.0.0.1:7546/');

const contractName = 'IntegrityChecker';
const bytecodePath = path.join(__dirname, `${contractName}.bin`);
const bytecode = fs.readFileSync(bytecodePath, 'utf8');

const abi = require(`./${contractName}abi.json`);
const myContract = new web3.eth.Contract(abi);
myContract.handleRevert = true;

async function deploy() {
	const providersAccounts = await web3.eth.getAccounts();
	const defaultAccount = providersAccounts[0];
	console.log('Deployer account:', defaultAccount);

	const contractDeployer = myContract.deploy({
		data: '0x' + bytecode,
		arguments: [1],
	});

	const gas = await contractDeployer.estimateGas({
		from: defaultAccount,
	});
	console.log('Estimated gas:', gas);

	try {
		const tx = await contractDeployer.send({
			from: defaultAccount,
			gas,
			gasPrice: 10000000000,
		});
		console.log('Contract deployed at address: ' + tx.options.address);

		const deployedAddressPath = path.join(__dirname, `${contractName}.txt`);
		fs.writeFileSync(deployedAddressPath, tx.options.address);

		const publicContractPath = path.join(__dirname, `browser/${contractName}.json`);
		const publicContractJson = JSON.parse(fs.readFileSync(publicContractPath));
		publicContractJson.address = tx.options.address;
		fs.writeFileSync(publicContractPath, JSON.stringify(publicContractJson, null, '\t'));

	} catch (error) {
		console.error(error);
	}
}

deploy();