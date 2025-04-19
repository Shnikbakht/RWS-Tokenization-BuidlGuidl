// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title IIdentityRegistry
 * @dev Interface for the IdentityRegistry contract
 */
interface IIdentityRegistry {
    function isVerified(address _investor) external view returns (bool);
    function identity(address _investor) external view returns (address);
}

/**
 * @title ICompliance
 * @dev Interface for the Compliance contract
 */
interface ICompliance {
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
    function addTokenHolder(address _to) external;
    function removeTokenHolder(address _from) external;
}

/**
 * @title IERC3643
 * @dev Interface for ERC-3643 tokens
 */
interface IERC3643 {
    function setIdentityRegistry(address _identityRegistry) external;
    function setCompliance(address _compliance) external;
    function pause() external;
    function unpause() external;
    function mint(address _to, uint256 _amount) external;
    function burn(address _from, uint256 _amount) external;
    function recoveryAddress(address _lostWallet, address _newWallet) external;
    function forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool);
    function batchForcedTransfer(address[] calldata _fromList, address[] calldata _toList, uint256[] calldata _amounts) external returns (bool);
    function identityRegistry() external view returns (address);
    function compliance() external view returns (address);
    function decimals() external view returns (uint8);
}

/**
 * @title ERC3643Token
 * @dev Implementation of ERC-3643 token standard with fractionalization
 */
contract ERC3643Token is ERC20, Pausable, Ownable, IERC3643 {
    // Identity Registry contract address
    address private _identityRegistry;
    
    // Compliance contract address
    address private _compliance;
    
    // List of agents that can perform certain actions
    mapping(address => bool) private _agents;
    
    // Property details
    string public propertyAddress;
    uint256 public propertyValue;
    uint256 public constant FRACTION_DECIMALS = 18;
    uint256 public constant SHARES_PER_PROPERTY = 1000;
    
    // Events
    event IdentityRegistrySet(address indexed identityRegistry);
    event ComplianceSet(address indexed compliance);
    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);
    event AddressRecovered(address indexed lostWallet, address indexed newWallet, uint256 amount);
    event PropertyDetailsSet(string propertyAddress, uint256 propertyValue);
    event TokensFrozen(address indexed wallet, uint256 amount);
    event TokensUnfrozen(address indexed wallet, uint256 amount);
    
    // Mapping of frozen tokens per wallet
    mapping(address => uint256) private _frozenTokens;
    
    // Modifiers
    
    /**
     * @dev Modifier to check if the sender is an agent
     */
    modifier onlyAgent() {
        require(_agents[msg.sender], "ERC3643Token: Not an agent");
        _;
    }
    
    /**
     * @dev Constructor
     * @param name Token name
     * @param symbol Token symbol
     * @param identityRegistry_ Address of the identity registry
     * @param compliance_ Address of the compliance contract
     * @param propertyAddr Physical address of the property
     * @param propertyVal Value of the property
     */
    constructor(
        string memory name,
        string memory symbol,
        address identityRegistry_,
        address compliance_,
        string memory propertyAddr,
        uint256 propertyVal
    ) ERC20(name, symbol) {
        require(identityRegistry_ != address(0), "ERC3643Token: Invalid identity registry");
        require(compliance_ != address(0), "ERC3643Token: Invalid compliance");
        
        _identityRegistry = identityRegistry_;
        _compliance = compliance_;
        propertyAddress = propertyAddr;
        propertyValue = propertyVal;
        
        emit IdentityRegistrySet(identityRegistry_);
        emit ComplianceSet(compliance_);
        emit PropertyDetailsSet(propertyAddr, propertyVal);
        
        // Add deployer as an agent
        _agents[msg.sender] = true;
        emit AgentAdded(msg.sender);
    }
    
    /**
     * @dev Sets the identity registry
     * @param identityRegistry_ Address of the identity registry
     */
    function setIdentityRegistry(address identityRegistry_) external override onlyOwner {
        require(identityRegistry_ != address(0), "ERC3643Token: Invalid identity registry");
        _identityRegistry = identityRegistry_;
        emit IdentityRegistrySet(identityRegistry_);
    }
    
    /**
     * @dev Sets the compliance contract
     * @param compliance_ Address of the compliance contract
     */
    function setCompliance(address compliance_) external override onlyOwner {
        require(compliance_ != address(0), "ERC3643Token: Invalid compliance");
        _compliance = compliance_;
        emit ComplianceSet(compliance_);
    }
    
    /**
     * @dev Adds an agent
     * @param agent Address of the agent
     */
    function addAgent(address agent) external onlyOwner {
        require(agent != address(0), "ERC3643Token: Invalid agent");
        require(!_agents[agent], "ERC3643Token: Already an agent");
        _agents[agent] = true;
        emit AgentAdded(agent);
    }
    
    /**
     * @dev Removes an agent
     * @param agent Address of the agent
     */
    function removeAgent(address agent) external onlyOwner {
        require(_agents[agent], "ERC3643Token: Not an agent");
        _agents[agent] = false;
        emit AgentRemoved(agent);
    }
    
    /**
     * @dev Pauses the token (stops transfers)
     */
    function pause() external override onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the token (allows transfers)
     */
    function unpause() external override onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Sets the property details
     * @param propertyAddr Physical address of the property
     * @param propertyVal Value of the property
     */
    function setPropertyDetails(string calldata propertyAddr, uint256 propertyVal) external onlyOwner {
        require(bytes(propertyAddr).length > 0, "ERC3643Token: Invalid property address");
        require(propertyVal > 0, "ERC3643Token: Invalid property value");
        
        propertyAddress = propertyAddr;
        propertyValue = propertyVal;
        
        emit PropertyDetailsSet(propertyAddr, propertyVal);
    }
    
    /**
     * @dev Mints tokens to an address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external override onlyAgent {
        require(to != address(0), "ERC3643Token: Invalid address");
        require(amount > 0, "ERC3643Token: Invalid amount");
        
        // Check if the receiver is eligible
        require(IIdentityRegistry(_identityRegistry).isVerified(to), "ERC3643Token: Receiver not verified");
        require(ICompliance(_compliance).canTransfer(address(0), to, amount), "ERC3643Token: Transfer not compliant");
        
        // Update token holder count in compliance
        ICompliance(_compliance).addTokenHolder(to);
        
        // Mint tokens
        _mint(to, amount);
    }
    
    /**
     * @dev Burns tokens from an address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external override onlyAgent {
        require(from != address(0), "ERC3643Token: Invalid address");
        require(amount > 0, "ERC3643Token: Invalid amount");
        require(amount <= balanceOf(from) - _frozenTokens[from], "ERC3643Token: Insufficient unfrozen balance");
        
        // Update token holder count in compliance if balance becomes zero
        if (balanceOf(from) == amount) {
            ICompliance(_compliance).removeTokenHolder(from);
        }
        
        // Burn tokens
        _burn(from, amount);
    }
    
    /**
 * @dev Internal implementation of forced transfer
 * @param from Address to transfer tokens from
 * @param to Address to transfer tokens to
 * @param amount Amount of tokens to transfer
 * @return True if successful
 */
function _forcedTransfer(address from, address to, uint256 amount) internal returns (bool) {
    require(from != address(0) && to != address(0), "ERC3643Token: Invalid address");
    require(amount > 0, "ERC3643Token: Invalid amount");
    require(amount <= balanceOf(from), "ERC3643Token: Insufficient balance");
    
    // Check if the receiver is eligible
    require(IIdentityRegistry(_identityRegistry).isVerified(to), "ERC3643Token: Receiver not verified");
    require(ICompliance(_compliance).canTransfer(from, to, amount), "ERC3643Token: Transfer not compliant");
    
    // Update token holder count in compliance
    if (balanceOf(to) == 0 && amount > 0) {
        ICompliance(_compliance).addTokenHolder(to);
    }
    if (balanceOf(from) == amount) {
        ICompliance(_compliance).removeTokenHolder(from);
    }
    
    // Transfer tokens
    _transfer(from, to, amount);
    
    return true;
}

/**
 * @dev Forces a transfer of tokens from one address to another
 * @param from Address to transfer tokens from
 * @param to Address to transfer tokens to
 * @param amount Amount of tokens to transfer
 * @return True if successful
 */
function forcedTransfer(address from, address to, uint256 amount) external override onlyAgent returns (bool) {
    return _forcedTransfer(from, to, amount);
}

/**
 * @dev Forces multiple transfers of tokens
 * @param fromList Addresses to transfer tokens from
 * @param toList Addresses to transfer tokens to
 * @param amounts Amounts of tokens to transfer
 * @return True if successful
 */
function batchForcedTransfer(
    address[] calldata fromList,
    address[] calldata toList,
    uint256[] calldata amounts
) external override onlyAgent returns (bool) {
    require(
        fromList.length == toList.length && fromList.length == amounts.length,
        "ERC3643Token: Arrays length mismatch"
    );
    
    for (uint256 i = 0; i < fromList.length; i++) {
        require(_forcedTransfer(fromList[i], toList[i], amounts[i]), "ERC3643Token: Forced transfer failed");
    }
    
    return true;
}
    
    /**
     * @dev Recovers tokens from a lost wallet to a new wallet
     * @param lostWallet Address of the lost wallet
     * @param newWallet Address of the new wallet
     */
    function recoveryAddress(address lostWallet, address newWallet) external override onlyAgent {
        require(lostWallet != address(0) && newWallet != address(0), "ERC3643Token: Invalid address");
        require(lostWallet != newWallet, "ERC3643Token: Same addresses");
        require(balanceOf(lostWallet) > 0, "ERC3643Token: No tokens to recover");
        
        // Check if the new wallet is eligible
        require(IIdentityRegistry(_identityRegistry).isVerified(newWallet), "ERC3643Token: New wallet not verified");
        
        // Get the balance of the lost wallet
        uint256 amount = balanceOf(lostWallet);
        
        // Update token holder count in compliance
        ICompliance(_compliance).addTokenHolder(newWallet);
        ICompliance(_compliance).removeTokenHolder(lostWallet);
        
        // Transfer tokens
        _transfer(lostWallet, newWallet, amount);
        
        emit AddressRecovered(lostWallet, newWallet, amount);
    }
    
    /**
     * @dev Freezes tokens from a wallet
     * @param wallet Address of the wallet
     * @param amount Amount of tokens to freeze
     */
    function freezeTokens(address wallet, uint256 amount) external onlyAgent {
        require(wallet != address(0), "ERC3643Token: Invalid address");
        require(amount > 0, "ERC3643Token: Invalid amount");
        require(amount <= balanceOf(wallet) - _frozenTokens[wallet], "ERC3643Token: Insufficient unfrozen balance");
        
        _frozenTokens[wallet] += amount;
        
        emit TokensFrozen(wallet, amount);
    }
    
    /**
     * @dev Unfreezes tokens from a wallet
     * @param wallet Address of the wallet
     * @param amount Amount of tokens to unfreeze
     */
    function unfreezeTokens(address wallet, uint256 amount) external onlyAgent {
        require(wallet != address(0), "ERC3643Token: Invalid address");
        require(amount > 0, "ERC3643Token: Invalid amount");
        require(amount <= _frozenTokens[wallet], "ERC3643Token: Insufficient frozen balance");
        
        _frozenTokens[wallet] -= amount;
        
        emit TokensUnfrozen(wallet, amount);
    }
    
    /**
     * @dev Gets the frozen balance of a wallet
     * @param wallet Address of the wallet
     * @return Frozen balance
     */
    function getFrozenTokens(address wallet) external view returns (uint256) {
        return _frozenTokens[wallet];
    }
    
    /**
     * @dev Gets the unfrozen balance of a wallet
     * @param wallet Address of the wallet
     * @return Unfrozen balance
     */
    function getUnfrozenTokens(address wallet) external view returns (uint256) {
        return balanceOf(wallet) - _frozenTokens[wallet];
    }
    
    /**
     * @dev Gets the identity registry
     * @return Address of the identity registry
     */
    function identityRegistry() external view override returns (address) {
        return _identityRegistry;
    }
    
    /**
     * @dev Gets the compliance contract
     * @return Address of the compliance contract
     */
    function compliance() external view override returns (address) {
        return _compliance;
    }
    
    /**
     * @dev Checks if an address is an agent
     * @param agent Address to check
     * @return True if the address is an agent
     */
    function isAgent(address agent) external view returns (bool) {
        return _agents[agent];
    }
    
    /**
     * @dev Gets the decimals of the token
     * @return Number of decimals
     */
    function decimals() public view override(ERC20, IERC3643) returns (uint8) {
        return uint8(FRACTION_DECIMALS);
    }
    
    /**
     * @dev Gets the total shares of the property
     * @return Number of shares
     */
    function totalShares() external pure returns (uint256) {
        return SHARES_PER_PROPERTY;
    }
    
    /**
     * @dev Gets the value per token
     * @return Value per token
     */
    function valuePerToken() external view returns (uint256) {
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == 0) {
            return 0;
        }
        return (propertyValue * (10 ** FRACTION_DECIMALS)) / totalSupply_;
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens
     * @param from Address of the sender
     * @param to Address of the receiver
     * @param amount Amount of tokens to transfer
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip checks for minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Check if sender has enough unfrozen tokens
        require(amount <= balanceOf(from) - _frozenTokens[from], "ERC3643Token: Insufficient unfrozen balance");
        
        // Check if both sender and receiver are verified
        require(IIdentityRegistry(_identityRegistry).isVerified(from), "ERC3643Token: Sender not verified");
        require(IIdentityRegistry(_identityRegistry).isVerified(to), "ERC3643Token: Receiver not verified");
        
        // Check if the transfer is compliant
        require(ICompliance(_compliance).canTransfer(from, to, amount), "ERC3643Token: Transfer not compliant");
        
        // Update token holder count in compliance
        if (balanceOf(to) == 0 && amount > 0) {
            ICompliance(_compliance).addTokenHolder(to);
        }
        if (balanceOf(from) == amount) {
            ICompliance(_compliance).removeTokenHolder(from);
        }
    }
}