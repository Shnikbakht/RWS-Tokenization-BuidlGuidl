// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ComplianceStorage.sol";

/**
 * @title IIdentityRegistry
 * @dev Interface for the IdentityRegistry contract
 */
interface IIdentityRegistry {
    function isVerified(address _investor) external view returns (bool);
    function identity(address _investor) external view returns (address);
    function investorCountry(address _investor) external view returns (uint16);
}

/**
 * @title Compliance
 * @dev Manages compliance rules for ERC-3643 token transfers
 */
contract Compliance is ComplianceStorage, Ownable {
    // Events
    event IdentityRegistrySet(address indexed identityRegistry);
    event CountryBlocked(uint16 indexed country);
    event CountryUnblocked(uint16 indexed country);
    event MaxTokenHoldersSet(uint256 maxTokenHolders);
    event TokenHolderAdded(address indexed tokenHolder);
    event TokenHolderRemoved(address indexed tokenHolder);

    /**
     * @dev Constructor
     * @param identityRegistry Address of the identity registry
     */
    constructor(address identityRegistry) {
        require(identityRegistry != address(0), "Compliance: Invalid address");
        _identityRegistry = identityRegistry;
        emit IdentityRegistrySet(identityRegistry);
        
        // Default max token holders
        _maxTokenHolders = 1000;
        emit MaxTokenHoldersSet(_maxTokenHolders);
    }

    /**
     * @dev Sets the identity registry
     * @param identityRegistry Address of the identity registry
     */
    function setIdentityRegistry(address identityRegistry) external onlyOwner {
        require(identityRegistry != address(0), "Compliance: Invalid address");
        _identityRegistry = identityRegistry;
        emit IdentityRegistrySet(identityRegistry);
    }

    /**
     * @dev Blocks a country
     * @param country Country code to block
     */
    function blockCountry(uint16 country) external onlyOwner {
        require(!_blockedCountries[country], "Compliance: Country already blocked");
        _blockedCountries[country] = true;
        emit CountryBlocked(country);
    }

    /**
     * @dev Unblocks a country
     * @param country Country code to unblock
     */
    function unblockCountry(uint16 country) external onlyOwner {
        require(_blockedCountries[country], "Compliance: Country not blocked");
        _blockedCountries[country] = false;
        emit CountryUnblocked(country);
    }

    /**
     * @dev Sets the maximum number of token holders
     * @param maxTokenHolders Maximum number of token holders
     */
    function setMaxTokenHolders(uint256 maxTokenHolders) external onlyOwner {
        require(maxTokenHolders > 0, "Compliance: Invalid max token holders");
        _maxTokenHolders = maxTokenHolders;
        emit MaxTokenHoldersSet(maxTokenHolders);
    }

    /**
     * @dev Updates token holder count when tokens are added to an account
     * @param account Address of the account
     */
    function addTokenHolder(address account) external onlyOwner {
        if (!_hasTokens[account]) {
            _hasTokens[account] = true;
            _tokenHolderCount++;
            emit TokenHolderAdded(account);
        }
    }

    /**
     * @dev Updates token holder count when tokens are removed from an account
     * @param account Address of the account
     */
    function removeTokenHolder(address account) external onlyOwner {
        if (_hasTokens[account]) {
            _hasTokens[account] = false;
            _tokenHolderCount--;
            emit TokenHolderRemoved(account);
        }
    }

    /**
     * @dev Checks if a transfer is compliant
     * @param from Address of the sender
     * @param to Address of the receiver
     * @param amount Amount of tokens to transfer
     * @return True if the transfer is compliant
     */
    function canTransfer(address from, address to, uint256 amount) external view returns (bool) {
        // If it's a mint (from is zero address), check only the receiver
        if (from == address(0)) {
            return _checkReceiver(to);
        }
        
        // If it's a burn (to is zero address), return true
        if (to == address(0)) {
            return true;
        }
        
        // Check if both sender and receiver are verified
        if (!IIdentityRegistry(_identityRegistry).isVerified(from) || 
            !IIdentityRegistry(_identityRegistry).isVerified(to)) {
            return false;
        }
        
        // Check if receiver's country is blocked
        uint16 receiverCountry = IIdentityRegistry(_identityRegistry).investorCountry(to);
        if (_blockedCountries[receiverCountry]) {
            return false;
        }
        
        // Check if max token holders would be exceeded
        if (!_hasTokens[to] && _tokenHolderCount >= _maxTokenHolders) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Checks if a receiver is compliant
     * @param to Address of the receiver
     * @return True if the receiver is compliant
     */
    function _checkReceiver(address to) internal view returns (bool) {
        // Check if receiver is verified
        if (!IIdentityRegistry(_identityRegistry).isVerified(to)) {
            return false;
        }
        
        // Check if receiver's country is blocked
        uint16 receiverCountry = IIdentityRegistry(_identityRegistry).investorCountry(to);
        if (_blockedCountries[receiverCountry]) {
            return false;
        }
        
        // Check if max token holders would be exceeded
        if (!_hasTokens[to] && _tokenHolderCount >= _maxTokenHolders) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Gets the identity registry
     * @return Address of the identity registry
     */
    function getIdentityRegistry() external view returns (address) {
        return _identityRegistry;
    }

    /**
     * @dev Checks if a country is blocked
     * @param country Country code to check
     * @return True if the country is blocked
     */
    function isCountryBlocked(uint16 country) external view returns (bool) {
        return _blockedCountries[country];
    }

    /**
     * @dev Gets the maximum number of token holders
     * @return Maximum number of token holders
     */
    function getMaxTokenHolders() external view returns (uint256) {
        return _maxTokenHolders;
    }

    /**
     * @dev Gets the current number of token holders
     * @return Current number of token holders
     */
    function tokenHolderCount() external view returns (uint256) {
        return _tokenHolderCount;
    }
}