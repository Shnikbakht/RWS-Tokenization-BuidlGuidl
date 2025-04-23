// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
interface IERC3643Token {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function forcedTransfer(address from, address to, uint256 amount) external returns (bool);
    function burn(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);

}

/**
 * @title VestingManager
 * @dev Manages the vesting schedule and redemption for real estate tokens
 */
contract VestingManager is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // The ERC3643 token representing real estate shares
    IERC3643Token public realEstateToken;
    
    // The stablecoin used for redemptions
    IERC20 public stablecoin;
    
    // Property value represented by the token
    uint256 public propertyValue;
    
    // Launch timestamp
    uint256 public launchTimestamp;
    
    // Full vesting period (7 years)
    uint256 public constant FULL_VESTING_PERIOD = 7 * 365 days;
    
    // Early redemption period (5 years)
    uint256 public constant EARLY_REDEMPTION_PERIOD = 5 * 365 days;
    
    // Early redemption penalty (10% = 1000 basis points)
    uint256 public earlyRedemptionPenalty = 1000;
    
    // Basis points denominator (10000 = 100%)
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000;
    
    // Mapping to track initial investments per investor
    mapping(address => uint256) public initialInvestments;
    
    // Mapping to track investment timestamps per investor
    mapping(address => uint256) public investmentTimestamps;
    
    // Redemption reserve (stablecoin) to handle buybacks
    uint256 public redemptionReserve;
    
    // Events
    event InvestmentRegistered(address indexed investor, uint256 amount, uint256 timestamp);
    event TokensRedeemed(address indexed investor, uint256 tokenAmount, uint256 stablecoinAmount, bool isEarlyRedemption);
    event RedemptionReserveIncreased(uint256 amount, uint256 newTotal);
    event EarlyRedemptionPenaltyUpdated(uint256 newPenalty);
    
    /**
     * @dev Constructor
     * @param _token Address of the ERC3643 token
     * @param _stablecoin Address of the stablecoin
     * @param _propertyValue Value of the property in stablecoin units
     */
    constructor(
        address _token,
        address _stablecoin,
        uint256 _propertyValue
    ) {
        require(_token != address(0), "Invalid token address");
        require(_stablecoin != address(0), "Invalid stablecoin address");
        require(_propertyValue > 0, "Invalid property value");
        
        realEstateToken = IERC3643Token(_token);
        stablecoin = IERC20(_stablecoin);
        propertyValue = _propertyValue;
        launchTimestamp = block.timestamp;
    }
    
    /**
     * @dev Registers a new investment - should be called when tokens are minted
     * @param _investor Address of the investor
     * @param _amount Amount of tokens invested
     */
    function registerInvestment(address _investor, uint256 _amount) external onlyOwner {
        require(_investor != address(0), "Invalid investor address");
        require(_amount > 0, "Invalid investment amount");
        
        initialInvestments[_investor] = initialInvestments[_investor].add(_amount);
        
        // Only update timestamp on first investment
        if (investmentTimestamps[_investor] == 0) {
            investmentTimestamps[_investor] = block.timestamp;
        }
        
        emit InvestmentRegistered(_investor, _amount, block.timestamp);
    }
    
    /**
     * @dev Updates the early redemption penalty
     * @param _newPenalty New penalty rate in basis points
     */
    function updateEarlyRedemptionPenalty(uint256 _newPenalty) external onlyOwner {
        require(_newPenalty <= 3000, "Penalty cannot exceed 30%");
        earlyRedemptionPenalty = _newPenalty;
        emit EarlyRedemptionPenaltyUpdated(_newPenalty);
    }
    
    /**
     * @dev Adds funds to the redemption reserve
     * @param _amount Amount of stablecoin to add
     */
    function addToRedemptionReserve(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        
        require(stablecoin.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        redemptionReserve = redemptionReserve.add(_amount);
        
        emit RedemptionReserveIncreased(_amount, redemptionReserve);
    }
    
    /**
     * @dev Redeems tokens for stablecoins
     * @param _amount Amount of tokens to redeem
     */
    function redeemTokens(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(realEstateToken.balanceOf(msg.sender) >= _amount, "Insufficient token balance");
        
        uint256 investmentTime = investmentTimestamps[msg.sender];
        require(investmentTime > 0, "No investment registered");
        
        uint256 timeSinceInvestment = block.timestamp.sub(investmentTime);
        
        // Check if redemption is allowed
        bool isEarlyRedemption = timeSinceInvestment >= EARLY_REDEMPTION_PERIOD && 
                                timeSinceInvestment < FULL_VESTING_PERIOD;
        
        require(
            timeSinceInvestment >= EARLY_REDEMPTION_PERIOD || 
            timeSinceInvestment >= FULL_VESTING_PERIOD,
            "Vesting period not reached"
        );
        
        // Calculate redemption amount
        uint256 totalSupply = realEstateToken.totalSupply();
            
        // propertyValue is likely in 18 decimals, tokens are in 18 decimals
        uint256 tokenValueInEther = propertyValue.mul(_amount).div(totalSupply);

        // Convert from 18 decimals to USDC's 6 decimals
        uint256 tokenValueInStablecoin = tokenValueInEther.div(10**12); // Divide by 10^(18-6)

        // Apply early redemption penalty if applicable
        if (isEarlyRedemption) {
            uint256 penalty = tokenValueInStablecoin.mul(earlyRedemptionPenalty).div(BASIS_POINTS_DENOMINATOR);
            tokenValueInStablecoin = tokenValueInStablecoin.sub(penalty);
        }
        console.log("tokenValueInStablecoin:", tokenValueInStablecoin);
        console.log("redemptionReserve:", redemptionReserve);

        // Check redemption reserve
        require(redemptionReserve >= tokenValueInStablecoin, "Insufficient redemption reserve");
        
        // Burn the tokens and update the redemption reserve
         realEstateToken.burn(msg.sender, _amount);
        
        // Transfer stablecoins to investor
        redemptionReserve = redemptionReserve.sub(tokenValueInStablecoin);
        require(stablecoin.transfer(msg.sender, tokenValueInStablecoin), "Stablecoin transfer failed");
        
        emit TokensRedeemed(msg.sender, _amount, tokenValueInStablecoin, isEarlyRedemption);
    }
    
    /**
     * @dev Checks if an investor can redeem their tokens
     * @param _investor Address of the investor
     * @return canRedeemEarly Whether early redemption is available
     * @return canRedeemFully Whether full redemption is available
     * @return timeUntilEarlyRedemption Time until early redemption (in seconds)
     * @return timeUntilFullRedemption Time until full redemption (in seconds)
     */
    function getRedemptionStatus(address _investor) external view returns (
        bool canRedeemEarly,
        bool canRedeemFully,
        uint256 timeUntilEarlyRedemption,
        uint256 timeUntilFullRedemption
    ) {
        uint256 investmentTime = investmentTimestamps[_investor];
        
        if (investmentTime == 0) {
            return (false, false, 0, 0);
        }
        
        uint256 timeSinceInvestment = block.timestamp.sub(investmentTime);
        
        canRedeemEarly = timeSinceInvestment >= EARLY_REDEMPTION_PERIOD;
        canRedeemFully = timeSinceInvestment >= FULL_VESTING_PERIOD;
        
        timeUntilEarlyRedemption = timeSinceInvestment >= EARLY_REDEMPTION_PERIOD ? 
            0 : EARLY_REDEMPTION_PERIOD.sub(timeSinceInvestment);
        
        timeUntilFullRedemption = timeSinceInvestment >= FULL_VESTING_PERIOD ? 
            0 : FULL_VESTING_PERIOD.sub(timeSinceInvestment);
        
        return (canRedeemEarly, canRedeemFully, timeUntilEarlyRedemption, timeUntilFullRedemption);
    }
}