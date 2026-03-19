# Intégrité de documents

## Fonctionnalités

Deux fonctionnalités:

* Signer un document : enregistre une entrée a partir du hash (avec le signataire et la date de signature) dans la Blockchain. Délivre un certificat PDF avec les informations de la signature.
* Vérifier l'**intégrité** d'un document : vérifier si le document existe dans la blockchain. Il est possible d'ajouter le certificat associé pour assurer l'**authenticité**.



---

## Comment configurer
A la racine du projet : ```npm install```

Dans le fichier ```.env``` configurer :
```DEPLOY_ACCOUNT``` : compte utilisé pour déployer le contrat
```BLOCKCHAIN_NETWORK_HOST``` : adresse du réseau ethereum (En principe doit valoir **127.0.0.1** ou **localhost**)
```BLOCKCHAIN_NETWORK_HOST``` : port configuré sur le réseau ethereum (souvent **8545** pour ganache-cli, **7545** pour ganache-gui)

Dans **solidity/** déployer le contrat : ```bash compile_and_deploy.sh```

---

## Lancer le projet
A la racine du projet : ```npm start```

---

## Contrat 


**Une structure Signature contenant l'adresse du signataire et la date**
```solidity
struct Signature{
      uint timestamp;
      address signataire;
  }
```

Un mapping **signatures <hash, Signature[]>**
```solidity
mapping (
      bytes32 => Signature[]
  ) signatures;
```

Un mapping **ont_signe <hash, mapping<address, bool>>** permettant une recherche en O(1)
```solidity
mapping (
  bytes32 => mapping(
      address => bool
  ) ) ont_signe;
```

**Des méthodes pour récupérer les détails des empreintes :**
```solidity
function getSignatures(bytes32 hash) external view returns (Signature[] memory){
    return signatures[hash];
}

function hasAddrAlreadySigned(bytes32 hash)public  view returns(bool){
    return ont_signe[hash][msg.sender];
}
```

**Une méthode addSignature pour ajouter un document à la Blockchain**
```solidity
function addSignature(
    bytes32 hash
) external {
    if(hasAddrAlreadySigned(hash)){
        emit addSignatureResult(msg.sender, hash, ALREADY_SIGNED);
    }

    signatures[hash].push(
        Signature({
            timestamp: block.timestamp,
            signataire: msg.sender
        })
    );
    ont_signe[hash][msg.sender] = true;
    emit addSignatureResult(msg.sender, hash, OK);
}
```

---
---

## Preview

![Preview](preview.gif)

