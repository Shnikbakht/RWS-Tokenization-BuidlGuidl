// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC3643Token {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function unfreezeTokens(address wallet, uint256 amount) external; // Add this line
}

interface IVestingManager {
    function getRedemptionStatus(address _investor) external view returns (
        bool canRedeemEarly,
        bool canRedeemFully,
        uint256 timeUntilEarlyRedemption,
        uint256 timeUntilFullRedemption
    );
}

/**
 * @title SecondaryMarket
 * @dev Facilitates secondary market trading of real estate tokens after the early redemption period
 */
contract SecondaryMarket is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // The ERC3643 token representing real estate shares
    IERC3643Token public realEstateToken;
    
    // The stablecoin used for payments
    IERC20 public paymentToken;
    
    // Reference to vesting manager to check lockup status
    IVestingManager public vestingManager;
    
    // Platform fee in basis points (0.5% = 50 basis points)
    uint256 public platformFee = 50;
    
    // Basis points denominator (10000 = 100%)
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000;
    
    // Sell order structure
    struct SellOrder {
        address seller;
        uint256 tokenAmount;
        uint256 pricePerToken;
        uint256 timestamp;
        bool active;
    }
    
    // Mapping of order ID to sell order
    mapping(uint256 => SellOrder) public sellOrders;
    
    // Order ID counter
    uint256 public nextOrderId = 1;
    
    // Total platform fees collected
    uint256 public totalFeesCollected;
    
    // Events
    event SellOrderCreated(uint256 indexed orderId, address indexed seller, uint256 tokenAmount, uint256 pricePerToken);
    event SellOrderCancelled(uint256 indexed orderId);
    event TokensPurchased(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 tokenAmount, uint256 totalPrice);
    event PlatformFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed recipient, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _token Address of the ERC3643 token
     * @param _paymentToken Address of the payment token
     * @param _vestingManager Address of the vesting manager
     */
    constructor(
        address _token,
        address _paymentToken,
        address _vestingManager
    ) {
        require(_token != address(0), "Invalid token address");
        require(_paymentToken != address(0), "Invalid payment token address");
        require(_vestingManager != address(0), "Invalid vesting manager address");
        
        realEstateToken = IERC3643Token(_token);
        paymentToken = IERC20(_paymentToken);
        vestingManager = IVestingManager(_vestingManager);
    }
    
    /**
     * @dev Creates a new sell order
     * @param _tokenAmount Amount of tokens to sell
     * @param _pricePerToken Price per token in payment tokens
     */
    function createSellOrder(uint256 _tokenAmount, uint256 _pricePerToken) external nonReentrant {
    require(_tokenAmount > 0, "Amount must be greater than 0");
    require(_pricePerToken > 0, "Price must be greater than 0");
    require(realEstateToken.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");

    // Check if tokens are approved for transfer by SecondaryMarket
uint256 allowance = IERC20(address(realEstateToken)).allowance(msg.sender, address(this));
    require(allowance >= _tokenAmount, "Insufficient token allowance for sale");

    // Optional: confirm vestingManager check for unlock
    (bool canRedeemEarly, , , ) = vestingManager.getRedemptionStatus(msg.sender);
    require(canRedeemEarly, "Tokens are still in lockup period");

    // Save sell order info without actually transferring tokens
    uint256 orderId = nextOrderId++;
    sellOrders[orderId] = SellOrder({
        seller: msg.sender,
        tokenAmount: _tokenAmount,
        pricePerToken: _pricePerToken,
        timestamp: block.timestamp,
        active: true
    });

    emit SellOrderCreated(orderId, msg.sender, _tokenAmount, _pricePerToken);
}

    
    /**
     * @dev Cancels a sell order and returns tokens to seller
     * @param _orderId ID of the order to cancel
     */
    function cancelSellOrder(uint256 _orderId) external nonReentrant {
    SellOrder storage order = sellOrders[_orderId];
    
    require(order.active, "Order not active");
    require(msg.sender == order.seller, "Not the seller");
    
    // Simply mark the order as inactive - no token transfer needed
    order.active = false;
    
    // No need to transfer tokens back, as they were never transferred to the contract
    
    emit SellOrderCancelled(_orderId);
}
    
    /**
     * @dev Purchases tokens from a sell order
     * @param _orderId ID of the order to purchase from
     * @param _tokenAmount Amount of tokens to purchase
     */
    function purchaseTokens(uint256 _orderId, uint256 _tokenAmount) external nonReentrant {
    SellOrder storage order = sellOrders[_orderId];
    
    require(order.active, "Order not active");
    require(_tokenAmount > 0 && _tokenAmount <= order.tokenAmount, "Invalid token amount");
    
    // Calculate total price and platform fee
    uint256 totalPrice = _tokenAmount.mul(order.pricePerToken).div(1e18); // Add decimal adjustment
    uint256 platformFeeAmount = totalPrice.mul(platformFee).div(BASIS_POINTS_DENOMINATOR);
    uint256 sellerAmount = totalPrice.sub(platformFeeAmount);
    
    // Transfer payment tokens from buyer
    require(paymentToken.transferFrom(msg.sender, address(this), totalPrice), "Payment transfer failed");
    
    // Transfer tokens directly from seller to buyer instead of from this contract
    require(realEstateToken.transferFrom(order.seller, msg.sender, _tokenAmount), "Token transfer failed");
    
    // Transfer payment to seller minus fee
    require(paymentToken.transfer(order.seller, sellerAmount), "Seller payment failed");
    
    // Update platform fees collected
    totalFeesCollected = totalFeesCollected.add(platformFeeAmount);
    
    // Update order
    order.tokenAmount = order.tokenAmount.sub(_tokenAmount);
    if (order.tokenAmount == 0) {
        order.active = false;
    }
    
    emit TokensPurchased(_orderId, msg.sender, order.seller, _tokenAmount, totalPrice);
}
    
    /**
     * @dev Updates the platform fee
     * @param _newFee New fee in basis points
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 300, "Fee cannot exceed 3%");
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }
    
    /**
     * @dev Withdraws collected fees
     * @param _recipient Address to receive the fees
     */
    function withdrawFees(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        require(totalFeesCollected > 0, "No fees to withdraw");
        
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        
        require(paymentToken.transfer(_recipient, amount), "Fee transfer failed");
        
        emit FeesWithdrawn(_recipient, amount);
    }
    
    /**
     * @dev Gets all active sell orders
     * @return orderIds Array of active order IDs
     */
    function getActiveSellOrders() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active orders
        for (uint256 i = 1; i < nextOrderId; i++) {
            if (sellOrders[i].active) {
                activeCount++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](activeCount);
        uint256 index = 0;
        
        // Populate result array
        for (uint256 i = 1; i < nextOrderId; i++) {
            if (sellOrders[i].active) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Gets sell order details
     * @param _orderId ID of the order
     * @return seller The seller address
     * @return tokenAmount The token amount available
     * @return pricePerToken Price per token
     * @return timestamp Creation timestamp
     * @return active Whether the order is active
     */
    function getSellOrder(uint256 _orderId) external view returns (
        address seller,
        uint256 tokenAmount,
        uint256 pricePerToken,
        uint256 timestamp,
        bool active
    ) {
        SellOrder storage order = sellOrders[_orderId];
        return (
            order.seller,
            order.tokenAmount,
            order.pricePerToken,
            order.timestamp,
            order.active
        );
    }
}