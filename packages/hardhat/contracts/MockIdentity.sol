// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title MockIdentity
 * @dev Mock implementation of ERC-734 and ERC-735 for testing
 */
contract MockIdentity {
    address private _owner;
    
    // Data structures for claims
    struct Claim {
        uint256 topic;
        uint256 scheme;
        address issuer;
        bytes signature;
        bytes data;
        string uri;
    }
    
    // Mapping of claim ID => Claim
    mapping(bytes32 => Claim) private _claims;
    
    // Mapping of topic => list of claim IDs
    mapping(uint256 => bytes32[]) private _claimsByTopic;
    
    // Mapping of key hash => purpose
    mapping(bytes32 => uint256) private _keys;
    
    // Events
    event ClaimAdded(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );
    
    /**
     * @dev Constructor
     * @param owner_ Address of the identity owner
     */
    constructor(address owner_) {
        _owner = owner_;
        
        // Add management key for the owner
        bytes32 key = keccak256(abi.encodePacked(owner_));
        _keys[key] = 1; // 1 = MANAGEMENT
    }
    
    /**
     * @dev Adds a claim to the identity
     * @param topic Claim topic
     * @param scheme Scheme used to sign the claim
     * @param issuer Address of the claim issuer
     * @param signature Signature of the claim
     * @param data Data of the claim
     * @param uri URI of the claim
     * @return claimId ID of the added claim
     */
    function addClaim(
        uint256 topic,
        uint256 scheme,
        address issuer,
        bytes calldata signature,
        bytes calldata data,
        string calldata uri
    ) external returns (bytes32 claimId) {
        require(msg.sender == _owner, "MockIdentity: Not the owner");
        
        claimId = keccak256(abi.encodePacked(issuer, topic));
        
        _claims[claimId] = Claim({
            topic: topic,
            scheme: scheme,
            issuer: issuer,
            signature: signature,
            data: data,
            uri: uri
        });
        
        _claimsByTopic[topic].push(claimId);
        
        emit ClaimAdded(
            claimId,
            topic,
            scheme,
            issuer,
            signature,
            data,
            uri
        );
        
        return claimId;
    }
    
    /**
     * @dev Adds a key to the identity
     * @param key Key to add
     * @param purpose Purpose of the key
     */
    function addKey(bytes32 key, uint256 purpose) external {
        require(msg.sender == _owner, "MockIdentity: Not the owner");
        _keys[key] = purpose;
    }
    
    /**
     * @dev Checks if a key has a purpose
     * @param key Key to check
     * @param purpose Purpose to check
     * @return True if the key has the purpose
     */
    function keyHasPurpose(bytes32 key, uint256 purpose) external view returns (bool) {
        return _keys[key] == purpose;
    }
    
    /**
     * @dev Gets a key
     * @param key Key to get
     * @return purpose Purpose of the key
     * @return keyType Type of the key
     * @return key Key
     */
    function getKey(bytes32 key) external view returns (uint256 purpose, bytes32 keyType, bytes32) {
        return (_keys[key], bytes32(0), key);
    }
    
    /**
     * @dev Gets a claim
     * @param claimId ID of the claim
     * @return topic Topic of the claim
     * @return scheme Scheme used to sign the claim
     * @return issuer Address of the claim issuer
     * @return signature Signature of the claim
     * @return data Data of the claim
     * @return uri URI of the claim
     */
    function getClaim(bytes32 claimId) external view returns (
        uint256 topic,
        uint256 scheme,
        address issuer,
        bytes memory signature,
        bytes memory data,
        string memory uri
    ) {
        Claim storage claim = _claims[claimId];
        return (
            claim.topic,
            claim.scheme,
            claim.issuer,
            claim.signature,
            claim.data,
            claim.uri
        );
    }
    
    /**
     * @dev Gets all claim IDs for a topic
     * @param topic Topic to get claims for
     * @return claimIds List of claim IDs for the topic
     */
    function getClaimIdsByTopic(uint256 topic) external view returns (bytes32[] memory) {
        return _claimsByTopic[topic];
    }
    
    /**
     * @dev Gets the owner of the identity
     * @return Address of the owner
     */
    function owner() external view returns (address) {
        return _owner;
    }
}