// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IdentityRegistryStorage
 * @dev Storage contract for identity registry data, separating storage from business logic
 */
contract IdentityRegistryStorage is Ownable {
    // Mapping of wallet address => identity contract
    mapping(address => address) private _identities;
    
    // Mapping of wallet address => country code (ISO 3166-1 numeric)
    mapping(address => uint16) private _countryCodes;
    
    // List of Identity Registries allowed to interact with this storage
    mapping(address => bool) private _authorizedRegistries;
    
    // Events
    event IdentityStored(address indexed investorAddress, address identity, uint16 countryCode);
    event IdentityRemoved(address indexed investorAddress);
    event CountryUpdated(address indexed investorAddress, uint16 countryCode);
    event RegistryAuthorized(address indexed registry);
    event RegistryUnauthorized(address indexed registry);
    
    /**
     * @dev Modifier to check if the sender is authorized
     */
    modifier onlyAuthorizedRegistry() {
        require(_authorizedRegistries[msg.sender], "IdentityRegistryStorage: Unauthorized registry");
        _;
    }
    
    /**
     * @dev Authorizes a registry to interact with this storage
     * @param registry Address of the registry to authorize
     */
    function authorizeRegistry(address registry) external onlyOwner {
        require(registry != address(0), "IdentityRegistryStorage: Invalid address");
        require(!_authorizedRegistries[registry], "IdentityRegistryStorage: Already authorized");
        
        _authorizedRegistries[registry] = true;
        
        emit RegistryAuthorized(registry);
    }
    
    /**
     * @dev Removes authorization from a registry
     * @param registry Address of the registry to unauthorize
     */
    function unauthorizeRegistry(address registry) external onlyOwner {
        require(_authorizedRegistries[registry], "IdentityRegistryStorage: Not authorized");
        
        _authorizedRegistries[registry] = false;
        
        emit RegistryUnauthorized(registry);
    }
    
    /**
     * @dev Stores an identity for an investor
     * @param investorAddress Address of the investor
     * @param identity Address of the identity contract
     * @param countryCode Country code of the investor
     */
    function storeIdentity(address investorAddress, address identity, uint16 countryCode) external onlyAuthorizedRegistry {
        require(investorAddress != address(0), "IdentityRegistryStorage: Invalid address");
        require(identity != address(0), "IdentityRegistryStorage: Invalid identity");
        
        _identities[investorAddress] = identity;
        _countryCodes[investorAddress] = countryCode;
        
        emit IdentityStored(investorAddress, identity, countryCode);
    }
    
    /**
     * @dev Removes an identity from storage
     * @param investorAddress Address of the investor
     */
    function removeIdentity(address investorAddress) external onlyAuthorizedRegistry {
        require(_identities[investorAddress] != address(0), "IdentityRegistryStorage: Identity not found");
        
        delete _identities[investorAddress];
        delete _countryCodes[investorAddress];
        
        emit IdentityRemoved(investorAddress);
    }
    
    /**
     * @dev Updates the country code of an investor
     * @param investorAddress Address of the investor
     * @param countryCode New country code
     */
    function updateCountry(address investorAddress, uint16 countryCode) external onlyAuthorizedRegistry {
        require(_identities[investorAddress] != address(0), "IdentityRegistryStorage: Identity not found");
        
        _countryCodes[investorAddress] = countryCode;
        
        emit CountryUpdated(investorAddress, countryCode);
    }
    
    /**
     * @dev Gets the identity of an investor
     * @param investorAddress Address of the investor
     * @return Address of the identity contract
     */
    function getIdentity(address investorAddress) external view returns (address) {
        return _identities[investorAddress];
    }
    
    /**
     * @dev Gets the country code of an investor
     * @param investorAddress Address of the investor
     * @return Country code
     */
    function getCountry(address investorAddress) external view returns (uint16) {
        return _countryCodes[investorAddress];
    }
    
    /**
     * @dev Checks if a registry is authorized
     * @param registry Address of the registry
     * @return True if the registry is authorized
     */
    function isRegistryAuthorized(address registry) external view returns (bool) {
        return _authorizedRegistries[registry];
    }
}