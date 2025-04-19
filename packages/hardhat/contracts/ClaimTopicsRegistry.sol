// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClaimTopicsRegistry
 * @dev Registry for required claim topics in the ERC-3643 token system
 */
contract ClaimTopicsRegistry is Ownable {
    // Array of required claim topics
    uint256[] private _claimTopics;
    
    // Mapping to check if a claim topic exists (topic => exists)
    mapping(uint256 => bool) private _claimTopicExists;
    
    // Events
    event ClaimTopicAdded(uint256 indexed claimTopic);
    event ClaimTopicRemoved(uint256 indexed claimTopic);

    /**
     * @dev Adds a claim topic to the registry
     * @param claimTopic Claim topic to add
     */
    function addClaimTopic(uint256 claimTopic) external onlyOwner {
        require(claimTopic != 0, "ClaimTopicsRegistry: Invalid claim topic");
        require(!_claimTopicExists[claimTopic], "ClaimTopicsRegistry: Already registered");
        
        _claimTopics.push(claimTopic);
        _claimTopicExists[claimTopic] = true;
        
        emit ClaimTopicAdded(claimTopic);
    }

    /**
     * @dev Removes a claim topic from the registry
     * @param claimTopic Claim topic to remove
     */
    function removeClaimTopic(uint256 claimTopic) external onlyOwner {
        require(_claimTopicExists[claimTopic], "ClaimTopicsRegistry: Not registered");
        
        // Find the index of the claim topic
        uint256 index;
        for (uint256 i = 0; i < _claimTopics.length; i++) {
            if (_claimTopics[i] == claimTopic) {
                index = i;
                break;
            }
        }
        
        // Move the last element to the removed position
        if (index != _claimTopics.length - 1) {
            _claimTopics[index] = _claimTopics[_claimTopics.length - 1];
        }
        
        // Remove the last element
        _claimTopics.pop();
        
        // Set exists to false
        _claimTopicExists[claimTopic] = false;
        
        emit ClaimTopicRemoved(claimTopic);
    }

    /**
     * @dev Gets all claim topics
     * @return Array of claim topics
     */
    function getClaimTopics() external view returns (uint256[] memory) {
        return _claimTopics;
    }
    
    /**
     * @dev Gets the number of claim topics
     * @return Number of claim topics
     */
    function getClaimTopicsCount() external view returns (uint256) {
        return _claimTopics.length;
    }
    
    /**
     * @dev Checks if a claim topic exists
     * @param claimTopic Claim topic to check
     * @return True if the claim topic exists
     */
    function isClaimTopicRegistered(uint256 claimTopic) external view returns (bool) {
        return _claimTopicExists[claimTopic];
    }
}