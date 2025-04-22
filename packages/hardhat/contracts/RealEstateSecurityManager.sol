// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC3643Token {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function mint(address to, uint256 amount) external;
    function addAgent(address agent) external;
    function removeAgent(address agent) external;
}

interface IDividendManager {
    function createDistribution(uint256 _totalAmount) external;
    function updateDividendRate(uint256 _newRate) external;
}

interface IVestingManager {
    function registerInvestment(address _investor, uint256 _amount) external;
    function addToRedemptionReserve(uint256 _amount) external;
    function updateEarlyRedemptionPenalty(uint256 _newPenalty) external;
}

interface ISecondaryMarket {
    function updatePlatformFee(uint256 _newFee) external;
    function withdrawFees(address _recipient) external;
}

/**
 * @title RealEstateSecurityManager
 * @dev Central management contract for the real estate security token system
 */
contract RealEstateSecurityManager is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // Core contracts
    IERC3643Token public token;
    IERC20 public stablecoin;
    IDividendManager public dividendManager;
    IVestingManager public vestingManager;
    ISecondaryMarket public secondaryMarket;
    
    // Fee recipient address
    address public feeRecipient;
    
    // Annual dividend rate (5% = 500 basis points)
    uint256 public annualDividendRate = 500;
    
    // Last dividend distribution timestamp
    uint256 public lastDividendTimestamp;
    
    // Events
    event TokensMinted(address indexed investor, uint256 amount);
    event DividendDistributed(uint256 amount, uint256 timestamp);
    event RedemptionReserveFunded(uint256 amount, uint256 timestamp);
    event FeeRecipientUpdated(address indexed newRecipient);
    event DividendRateUpdated(uint256 newRate);   


    
    /**
     * @dev Constructor
     * @param _token Address of the ERC3643 token
     * @param _stablecoin Address of the stablecoin
     * @param _dividendManager Address of the dividend manager
     * @param _vestingManager Address of the vesting manager
     * @param _secondaryMarket Address of the secondary market
     * @param _feeRecipient Address to receive fees
     */
    constructor(
        address _token,
        address _stablecoin,
        address _dividendManager,
        address _vestingManager,
        address _secondaryMarket,
        address _feeRecipient
    ) {
        require(_token != address(0), "Invalid token address");
        require(_stablecoin != address(0), "Invalid stablecoin address");
        require(_dividendManager != address(0), "Invalid dividend manager address");
        require(_vestingManager != address(0), "Invalid vesting manager address");
        require(_secondaryMarket != address(0), "Invalid secondary market address");
        require(_feeRecipient != address(0), "Invalid fee recipient address");
        
        token = IERC3643Token(_token);
        stablecoin = IERC20(_stablecoin);
        dividendManager = IDividendManager(_dividendManager);
        vestingManager = IVestingManager(_vestingManager);
        secondaryMarket = ISecondaryMarket(_secondaryMarket);
        feeRecipient = _feeRecipient;
        
    }
    
function initialize() external onlyOwner {
    dividendManager.updateDividendRate(annualDividendRate);
}


    /**
     * @dev Mints new tokens to an investor and registers their investment
     * @param _investor Address of the investor
     * @param _tokenAmount Amount of tokens to mint
     */
    function mintTokens(address _investor, uint256 _tokenAmount) external onlyOwner {
        require(_investor != address(0), "Invalid investor address");
        require(_tokenAmount > 0, "Invalid token amount");
        
        // Mint tokens to the investor
        token.mint(_investor, _tokenAmount);
        
        // Register investment in vesting manager
        vestingManager.registerInvestment(_investor, _tokenAmount);
        
        emit TokensMinted(_investor, _tokenAmount);
    }
    
    /**
     * @dev Distributes annual dividends
     * @param _totalAmount Total amount of stablecoins for dividend distribution
     */
    function distributeDividends(uint256 _totalAmount) external onlyOwner nonReentrant {
        require(_totalAmount > 0, "Invalid amount");
        
        // Transfer stablecoins to dividend manager
        require(
            stablecoin.transferFrom(msg.sender, address(this), _totalAmount),
            "Stablecoin transfer failed"
        );
        
        // Approve dividend manager to spend the tokens
        stablecoin.approve(address(dividendManager), _totalAmount);
        
        // Create dividend distribution
        dividendManager.createDistribution(_totalAmount);
        
        lastDividendTimestamp = block.timestamp;
        
        emit DividendDistributed(_totalAmount, block.timestamp);
    }
    
    /**
     * @dev Funds the redemption reserve for token buybacks
     * @param _amount Amount of stablecoins to add to redemption reserve
     */
    function fundRedemptionReserve(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Invalid amount");
        
        // Transfer stablecoins to vesting manager
        require(
            stablecoin.transferFrom(msg.sender, address(this), _amount),
            "Stablecoin transfer failed"
        );
        
        // Approve vesting manager to spend the tokens
        stablecoin.approve(address(vestingManager), _amount);
        
        // Add to redemption reserve
        vestingManager.addToRedemptionReserve(_amount);
        
        emit RedemptionReserveFunded(_amount, block.timestamp);
    }
    
    /**
     * @dev Withdraws secondary market fees
     */
    function withdrawMarketFees() external onlyOwner {
        secondaryMarket.withdrawFees(feeRecipient);
    }
    
    /**
     * @dev Updates the fee recipient address
     * @param _newRecipient New fee recipient address
     */
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient address");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }
    
    /**
     * @dev Updates the annual dividend rate
     * @param _newRate New dividend rate in basis points
     */
    function updateDividendRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 2000, "Rate cannot exceed 20%");
        annualDividendRate = _newRate;
        dividendManager.updateDividendRate(_newRate);
        emit DividendRateUpdated(_newRate);
    }
    
    /**
     * @dev Updates the early redemption penalty
     * @param _newPenalty New penalty rate in basis points
     */
    function updateEarlyRedemptionPenalty(uint256 _newPenalty) external onlyOwner {
        vestingManager.updateEarlyRedemptionPenalty(_newPenalty);
    }
    
    /**
     * @dev Updates the secondary market platform fee
     * @param _newFee New fee in basis points
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        secondaryMarket.updatePlatformFee(_newFee);
    }
    
    /**
     * @dev Sets system contracts as agents on the token
     */
    function setupAgents() external onlyOwner {
        token.addAgent(address(vestingManager));
        token.addAgent(address(this));
    }
    
    /**
     * @dev Calculates expected annual dividend based on current token supply and rate
     * @return Expected annual dividend amount
     */
    function calculateAnnualDividend() external view returns (uint256) {
        uint256 totalSupply = token.totalSupply();
        return totalSupply.mul(annualDividendRate).div(10000);
    }
}