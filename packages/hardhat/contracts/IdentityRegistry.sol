// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IClaimTopicsRegistry
 * @dev Interface for the ClaimTopicsRegistry contract
 */
interface IClaimTopicsRegistry {
    function getClaimTopics() external view returns (uint256[] memory);
}

/**
 * @title ITrustedIssuersRegistry
 * @dev Interface for the TrustedIssuersRegistry contract
 */
interface ITrustedIssuersRegistry {
    function getTrustedIssuers() external view returns (address[] memory);
    function isTrustedIssuer(address _issuer) external view returns (bool);
    function getTrustedIssuerClaimTopics(address _trustedIssuer) external view returns (uint256[] memory);
}

/**
 * @title IIdentity
 * @dev Interface for ERC-734 & ERC-735 (Identity and claims)
 */
interface IIdentity {
    function keyHasPurpose(bytes32 _key, uint256 _purpose) external view returns (bool);
    function getKey(bytes32 _key) external view returns (uint256 purpose, bytes32 keyType, bytes32 key);
    function getClaim(bytes32 _claimId) external view returns (
        uint256 topic,
        uint256 scheme,
        address issuer,
        bytes memory signature,
        bytes memory data,
        string memory uri
    );
    function getClaimIdsByTopic(uint256 _topic) external view returns (bytes32[] memory);
}

/**
 * @title IIdentityRegistryStorage
 * @dev Interface for the IdentityRegistryStorage contract
 */
interface IIdentityRegistryStorage {
    function storeIdentity(address _investorAddress, address _identity, uint16 _countryCode) external;
    function removeIdentity(address _investorAddress) external;
    function updateCountry(address _investorAddress, uint16 _countryCode) external;
    function getIdentity(address _investorAddress) external view returns (address);
    function getCountry(address _investorAddress) external view returns (uint16);
}

/**
 * @title IdentityRegistry
 * @dev Registry for ERC-3643 identities with validation against trusted issuers
 */
contract IdentityRegistry is Ownable {
    // Addresses of trusted contracts
    address private _trustedIssuersRegistry;
    address private _claimTopicsRegistry;
    address private _identityStorage;
    
    // Mapping of agent addresses
    mapping(address => bool) private _agents;
    
    // Events
    event IdentityRegistered(address indexed investorAddress, address identity, uint16 countryCode);
    event IdentityRemoved(address indexed investorAddress);
    event CountryUpdated(address indexed investorAddress, uint16 countryCode);
    event TrustedIssuersRegistrySet(address indexed trustedIssuersRegistry);
    event ClaimTopicsRegistrySet(address indexed claimTopicsRegistry);
    event IdentityStorageSet(address indexed identityStorage);
    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);

    /**
     * @dev Modifier to check if the sender is an agent
     */
    modifier onlyAgent() {
        require(_agents[msg.sender] || msg.sender == owner(), "IdentityRegistry: Not an agent");
        _;
    }

    /**
     * @dev Constructor
     * @param trustedIssuersRegistry Address of the trusted issuers registry
     * @param claimTopicsRegistry Address of the claim topics registry
     * @param identityStorage Address of the identity storage
     */
    constructor(
        address trustedIssuersRegistry, 
        address claimTopicsRegistry, 
        address identityStorage
    ) {
        setTrustedIssuersRegistry(trustedIssuersRegistry);
        setClaimTopicsRegistry(claimTopicsRegistry);
        setIdentityStorage(identityStorage);
    }

    /**
     * @dev Sets the trusted issuers registry
     * @param trustedIssuersRegistry Address of the trusted issuers registry
     */
    function setTrustedIssuersRegistry(address trustedIssuersRegistry) public onlyOwner {
        require(trustedIssuersRegistry != address(0), "IdentityRegistry: Invalid address");
        _trustedIssuersRegistry = trustedIssuersRegistry;
        emit TrustedIssuersRegistrySet(trustedIssuersRegistry);
    }

    /**
     * @dev Sets the claim topics registry
     * @param claimTopicsRegistry Address of the claim topics registry
     */
    function setClaimTopicsRegistry(address claimTopicsRegistry) public onlyOwner {
        require(claimTopicsRegistry != address(0), "IdentityRegistry: Invalid address");
        _claimTopicsRegistry = claimTopicsRegistry;
        emit ClaimTopicsRegistrySet(claimTopicsRegistry);
    }

    /**
     * @dev Sets the identity storage
     * @param identityStorage Address of the identity storage
     */
    function setIdentityStorage(address identityStorage) public onlyOwner {
        require(identityStorage != address(0), "IdentityRegistry: Invalid address");
        _identityStorage = identityStorage;
        emit IdentityStorageSet(identityStorage);
    }

    /**
     * @dev Adds an agent
     * @param agent Address of the agent
     */
    function addAgent(address agent) external onlyOwner {
        require(agent != address(0), "IdentityRegistry: Invalid address");
        require(!_agents[agent], "IdentityRegistry: Already an agent");
        _agents[agent] = true;
        emit AgentAdded(agent);
    }

    /**
     * @dev Removes an agent
     * @param agent Address of the agent
     */
    function removeAgent(address agent) external onlyOwner {
        require(_agents[agent], "IdentityRegistry: Not an agent");
        _agents[agent] = false;
        emit AgentRemoved(agent);
    }

    /**
     * @dev Registers an identity for an investor
     * @param investorAddress Address of the investor
     * @param identity Address of the identity contract
     * @param countryCode Country code of the investor
     */
    function registerIdentity(address investorAddress, address identity, uint16 countryCode) external onlyAgent {
        require(investorAddress != address(0), "IdentityRegistry: Invalid address");
        require(identity != address(0), "IdentityRegistry: Invalid identity");
        require(IIdentityRegistryStorage(_identityStorage).getIdentity(investorAddress) == address(0), "IdentityRegistry: Identity already registered");
        
        IIdentityRegistryStorage(_identityStorage).storeIdentity(investorAddress, identity, countryCode);
        
        emit IdentityRegistered(investorAddress, identity, countryCode);
    }

    /**
     * @dev Updates the country code of an investor
     * @param investorAddress Address of the investor
     * @param countryCode New country code
     */
    function updateCountry(address investorAddress, uint16 countryCode) external onlyAgent {
        require(IIdentityRegistryStorage(_identityStorage).getIdentity(investorAddress) != address(0), "IdentityRegistry: Identity not registered");
        
        IIdentityRegistryStorage(_identityStorage).updateCountry(investorAddress, countryCode);
        
        emit CountryUpdated(investorAddress, countryCode);
    }

    /**
     * @dev Removes an identity from the registry
     * @param investorAddress Address of the investor
     */
    function deleteIdentity(address investorAddress) external onlyAgent {
        require(IIdentityRegistryStorage(_identityStorage).getIdentity(investorAddress) != address(0), "IdentityRegistry: Identity not registered");
        
        IIdentityRegistryStorage(_identityStorage).removeIdentity(investorAddress);
        
        emit IdentityRemoved(investorAddress);
    }

    /**
     * @dev Checks if an identity is verified against the trusted issuers
     * @param investorAddress Address of the investor
     * @return True if the identity is verified
     */
    function isVerified(address investorAddress) external view returns (bool) {
        address identity = IIdentityRegistryStorage(_identityStorage).getIdentity(investorAddress);
        
        // If no identity is registered, return false
        if (identity == address(0)) {
            return false;
        }
        
        // Get required claim topics
        uint256[] memory claimTopics = IClaimTopicsRegistry(_claimTopicsRegistry).getClaimTopics();
        
        // Get trusted issuers
        address[] memory trustedIssuers = ITrustedIssuersRegistry(_trustedIssuersRegistry).getTrustedIssuers();
        
        // Check each claim topic
        for (uint256 i = 0; i < claimTopics.length; i++) {
            uint256 claimTopic = claimTopics[i];
            
            // Get all claims for this topic
            bytes32[] memory claimIds = IIdentity(identity).getClaimIdsByTopic(claimTopic);
            
            bool claimValid = false;
            
            // Check each claim
            for (uint256 j = 0; j < claimIds.length; j++) {
                bytes32 claimId = claimIds[j];
                
                (uint256 topic, uint256 scheme, address issuer, bytes memory signature, bytes memory data, string memory uri) = IIdentity(identity).getClaim(claimId);

                
                // Check if issuer is trusted for this claim topic
                if (topic == claimTopic && 
                    ITrustedIssuersRegistry(_trustedIssuersRegistry).isTrustedIssuer(issuer)) {
                    
                    uint256[] memory issuerClaimTopics = 
                        ITrustedIssuersRegistry(_trustedIssuersRegistry).getTrustedIssuerClaimTopics(issuer);
                    
                    // Check if this issuer is trusted for this specific claim topic
                    for (uint256 k = 0; k < issuerClaimTopics.length; k++) {
                        if (issuerClaimTopics[k] == claimTopic) {
                            // Verify the claim by checking if the key has claim signing purpose (3)
                            bytes32 key = keccak256(abi.encode(issuer, claimTopic));
                            
                            if (IIdentity(issuer).keyHasPurpose(key, 3)) {
                                claimValid = true;
                                break;
                            }
                        }
                    }
                }
                
                if (claimValid) {
                    break;
                }
            }
            
            if (!claimValid) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * @dev Gets the identity of an investor
     * @param investorAddress Address of the investor
     * @return Address of the identity contract
     */
    function getIdentity(address investorAddress) external view returns (address) {
        return IIdentityRegistryStorage(_identityStorage).getIdentity(investorAddress);
    }

    /**
     * @dev Gets the country code of an investor
     * @param investorAddress Address of the investor
     * @return Country code
     */
    function investorCountry(address investorAddress) external view returns (uint16) {
        return IIdentityRegistryStorage(_identityStorage).getCountry(investorAddress);
    }

    /**
     * @dev Gets the trusted issuers registry
     * @return Address of the trusted issuers registry
     */
    function getTrustedIssuersRegistry() external view returns (address) {
        return _trustedIssuersRegistry;
    }

    /**
     * @dev Gets the claim topics registry
     * @return Address of the claim topics registry
     */
    function getClaimTopicsRegistry() external view returns (address) {
        return _claimTopicsRegistry;
    }

    /**
     * @dev Gets the identity storage
     * @return Address of the identity storage
     */
    function getIdentityStorage() external view returns (address) {
        return _identityStorage;
    }

    /**
     * @dev Checks if an address is an agent
     * @param agent Address of the agent
     * @return True if the address is an agent
     */
    function isAgent(address agent) external view returns (bool) {
        return _agents[agent];
    }
}