// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrustedIssuersRegistry
 * @dev Registry for trusted claim issuers in the ERC-3643 token system
 */
contract TrustedIssuersRegistry is Ownable {
    // Array of trusted issuers
    address[] private _trustedIssuers;
    
    // Mapping of trusted issuer => index in _trustedIssuers (index+1 to handle 0 as default value)
    mapping(address => uint256) private _trustedIssuerIndex;
    
    // Mapping of trusted issuer => claim topics they can issue
    mapping(address => uint256[]) private _trustedIssuerClaimTopics;
    
    // Events
    event TrustedIssuerAdded(address indexed trustedIssuer, uint256[] claimTopics);
    event TrustedIssuerRemoved(address indexed trustedIssuer);
    event TrustedIssuerClaimTopicsUpdated(address indexed trustedIssuer, uint256[] claimTopics);

    /**
     * @dev Adds a trusted issuer with their claim topics
     * @param trustedIssuer Address of the trusted issuer
     * @param claimTopics Array of claim topics the issuer can issue
     */
    function addTrustedIssuer(address trustedIssuer, uint256[] calldata claimTopics) external onlyOwner {
        require(trustedIssuer != address(0), "TrustedIssuersRegistry: Invalid address");
        require(claimTopics.length > 0, "TrustedIssuersRegistry: Empty claim topics");
        require(_trustedIssuerIndex[trustedIssuer] == 0, "TrustedIssuersRegistry: Already registered");
        
        // Add to the array
        _trustedIssuers.push(trustedIssuer);
        
        // Set the index (+1 to handle 0 as default)
        _trustedIssuerIndex[trustedIssuer] = _trustedIssuers.length;
        
        // Set the claim topics
        _trustedIssuerClaimTopics[trustedIssuer] = claimTopics;
        
        emit TrustedIssuerAdded(trustedIssuer, claimTopics);
    }

    /**
     * @dev Removes a trusted issuer
     * @param trustedIssuer Address of the trusted issuer
     */
    function removeTrustedIssuer(address trustedIssuer) external onlyOwner {
        require(_trustedIssuerIndex[trustedIssuer] != 0, "TrustedIssuersRegistry: Not registered");
        
        // Calculate real index (stored index - 1)
        uint256 index = _trustedIssuerIndex[trustedIssuer] - 1;
        uint256 lastIndex = _trustedIssuers.length - 1;
        
        if (index != lastIndex) {
            // Move the last element to the removed position
            address lastIssuer = _trustedIssuers[lastIndex];
            _trustedIssuers[index] = lastIssuer;
            _trustedIssuerIndex[lastIssuer] = index + 1;
        }
        
        // Remove the last element
        _trustedIssuers.pop();
        
        // Reset the index
        delete _trustedIssuerIndex[trustedIssuer];
        
        // Reset the claim topics
        delete _trustedIssuerClaimTopics[trustedIssuer];
        
        emit TrustedIssuerRemoved(trustedIssuer);
    }

    /**
     * @dev Updates the claim topics of a trusted issuer
     * @param trustedIssuer Address of the trusted issuer
     * @param claimTopics New array of claim topics
     */
    function updateIssuerClaimTopics(address trustedIssuer, uint256[] calldata claimTopics) external onlyOwner {
        require(_trustedIssuerIndex[trustedIssuer] != 0, "TrustedIssuersRegistry: Not registered");
        require(claimTopics.length > 0, "TrustedIssuersRegistry: Empty claim topics");
        
        _trustedIssuerClaimTopics[trustedIssuer] = claimTopics;
        
        emit TrustedIssuerClaimTopicsUpdated(trustedIssuer, claimTopics);
    }

    /**
     * @dev Checks if an address is a trusted issuer
     * @param issuer Address to check
     * @return True if the address is a trusted issuer
     */
    function isTrustedIssuer(address issuer) external view returns (bool) {
        return _trustedIssuerIndex[issuer] != 0;
    }

    /**
     * @dev Gets the claim topics a trusted issuer can issue
     * @param trustedIssuer Address of the trusted issuer
     * @return Array of claim topics
     */
    function getTrustedIssuerClaimTopics(address trustedIssuer) external view returns (uint256[] memory) {
        require(_trustedIssuerIndex[trustedIssuer] != 0, "TrustedIssuersRegistry: Not registered");
        
        return _trustedIssuerClaimTopics[trustedIssuer];
    }

    /**
     * @dev Gets the list of all trusted issuers
     * @return Array of trusted issuer addresses
     */
    function getTrustedIssuers() external view returns (address[] memory) {
        return _trustedIssuers;
    }
    
    /**
     * @dev Gets the number of trusted issuers
     * @return Number of trusted issuers
     */
    function getTrustedIssuersCount() external view returns (uint256) {
        return _trustedIssuers.length;
    }
}