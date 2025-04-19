// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ComplianceStorage
 * @dev Storage contract for compliance data
 */
contract ComplianceStorage {
    // Identity Registry
    address internal _identityRegistry;
    
    // Mapping of countries that are blocked or allowed
    mapping(uint16 => bool) internal _blockedCountries;
    
    // Maximum number of token holders
    uint256 internal _maxTokenHolders;
    
    // Current number of token holders (investors with balance > 0)
    uint256 internal _tokenHolderCount;
    
    // Mapping of investor address => has tokens
    mapping(address => bool) internal _hasTokens;
}