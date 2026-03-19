pragma solidity ^0.8.0;

contract IntegrityChecker{

    int128 public constant OK=0;
    int128 public constant ALREADY_SIGNED=8;

    event addSignatureResult(address signataire, bytes32 hash, int128 code);

    struct Signature{
        uint timestamp;
        address signataire;
    }

    // mappings
    mapping (
        bytes32 => Signature[]
    ) signatures;

    mapping (
        bytes32 => mapping(
            address => bool
        ) ) ont_signe;


    function getSignatures(bytes32 hash) external view returns (Signature[] memory){
        return signatures[hash];
    }

    function hasAddrAlreadySigned(bytes32 hash)public  view returns(bool){
        return ont_signe[hash][msg.sender];
    }

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
}