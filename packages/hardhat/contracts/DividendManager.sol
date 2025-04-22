// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC3643 {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

/**
 * @title DividendManager
 * @dev Contract to manage dividend distributions for ERC3643 token holders
 */
contract DividendManager is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // The ERC3643 token representing real estate shares
    IERC3643 public token;
    
    // The stablecoin used for dividend payments (e.g., USDC)
    IERC20 public dividendToken;
    
    // Annual dividend rate (5% = 500 basis points)
    uint256 public dividendRate = 500;
    
    // Basis points denominator (10000 = 100%)
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000;
    
    // Timestamp of the last dividend distribution
    uint256 public lastDistributionTimestamp;
    
    // Minimum interval between distributions (1 year in seconds)
    uint256 public constant DISTRIBUTION_INTERVAL = 365 days;
    
    // Mapping to track claimed dividends per distribution
    mapping(uint256 => mapping(address => bool)) public dividendClaimed;
    
    // Distribution ID counter
    uint256 public currentDistributionId;
    
    // Distribution details
    struct Distribution {
        uint256 timestamp;
        uint256 totalAmount;
        uint256 totalSupplySnapshot;
        bool finalized;
    }
    
    // Mapping of distribution ID to distribution details
    mapping(uint256 => Distribution) public distributions;
    
    // Events
    event DividendDistributionCreated(uint256 distributionId, uint256 amount, uint256 timestamp);
    event DividendClaimed(address indexed investor, uint256 distributionId, uint256 amount);
    event DividendRateUpdated(uint256 newRate);
    
    /**
     * @dev Constructor
     * @param _token Address of the ERC3643 token
     * @param _dividendToken Address of the stablecoin used for dividends
     */
    constructor(address _token, address _dividendToken) {
        require(_token != address(0), "Invalid token address");
        require(_dividendToken != address(0), "Invalid dividend token address");
        
        token = IERC3643(_token);
        dividendToken = IERC20(_dividendToken);
    }
    
    /**
     * @dev Updates the dividend rate
     * @param _newRate New dividend rate in basis points
     */
    function updateDividendRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 2000, "Rate cannot exceed 20%"); // Reasonable maximum cap
        dividendRate = _newRate;
        emit DividendRateUpdated(_newRate);
    }
    
    /**
     * @dev Creates a new dividend distribution
     * @param _totalAmount Total amount of stablecoins to distribute
     */
    function createDistribution(uint256 _totalAmount) external onlyOwner {
        require(
            block.timestamp >= lastDistributionTimestamp + DISTRIBUTION_INTERVAL,
            "Distribution interval not reached"
        );
        require(_totalAmount > 0, "Amount must be greater than 0");
        
        // Transfer stablecoins to this contract
        require(
            dividendToken.transferFrom(msg.sender, address(this), _totalAmount),
            "Transfer failed"
        );
        
        // Create new distribution
        currentDistributionId++;
        distributions[currentDistributionId] = Distribution({
            timestamp: block.timestamp,
            totalAmount: _totalAmount,
            totalSupplySnapshot: token.totalSupply(),
            finalized: true
        });
        
        lastDistributionTimestamp = block.timestamp;
        
        emit DividendDistributionCreated(currentDistributionId, _totalAmount, block.timestamp);
    }
    
    /**
     * @dev Allows an investor to claim their dividend for a specific distribution
     * @param _distributionId ID of the distribution to claim from
     */
    function claimDividend(uint256 _distributionId) external nonReentrant {
        require(_distributionId > 0 && _distributionId <= currentDistributionId, "Invalid distribution ID");
        require(!dividendClaimed[_distributionId][msg.sender], "Dividend already claimed");
        require(distributions[_distributionId].finalized, "Distribution not finalized");
        
        Distribution storage distribution = distributions[_distributionId];
        
        // Calculate investor's share based on token balance at distribution time
        uint256 investorBalance = token.balanceOf(msg.sender);
        require(investorBalance > 0, "No tokens held");
        
        uint256 investorShare = distribution.totalAmount.mul(investorBalance).div(distribution.totalSupplySnapshot);
        require(investorShare > 0, "No dividend to claim");
        
        // Mark as claimed
        dividendClaimed[_distributionId][msg.sender] = true;
        
        // Transfer dividend tokens to investor
        require(dividendToken.transfer(msg.sender, investorShare), "Transfer failed");
        
        emit DividendClaimed(msg.sender, _distributionId, investorShare);
    }
    
    /**
     * @dev Calculates the expected annual dividend for a token amount
     * @param _tokenAmount Amount of tokens
     * @return Expected annual dividend amount
     */
    function calculateExpectedDividend(uint256 _tokenAmount) external view returns (uint256) {
        // This is a simplified calculation that assumes property value = token supply
        return _tokenAmount.mul(dividendRate).div(BASIS_POINTS_DENOMINATOR);
    }
}