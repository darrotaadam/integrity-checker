pragma solidity ^0.8.0;

contract IntegrityChecker{
    
    struct Signature{
        uint256 timestamp;
        address signataire;
    }

    

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


    function hasAddrAlreadySigned(bytes32 hash, address signataire)private view returns(bool){
        return ont_signe[hash][signataire];
    }


    function addSignature(
        bytes32 hash
    ) external {
        require(!hasAddrAlreadySigned(hash, msg.sender) );
        
        signatures[hash].push(
            Signature({
                timestamp: block.timestamp,
                signataire: msg.sender
            })
        );
        ont_signe[hash][msg.sender] = true;
    
    }
}