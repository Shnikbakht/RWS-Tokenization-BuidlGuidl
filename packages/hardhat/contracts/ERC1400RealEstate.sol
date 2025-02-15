// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ERC1400RealEstate is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    string public name = "Real Estate Security Token";
    string public symbol = "REST";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) private _balances;
    mapping(address => bool) private _whitelist;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(bytes32 => string) private _documents;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Whitelisted(address indexed account, bool status);
    event DocumentAdded(bytes32 indexed name, string uri);
    event ForcedTransfer(address indexed from, address indexed to, uint256 value);
    
    modifier onlyWhitelisted(address account) {
        require(_whitelist[account], "Address not whitelisted");
        _;
    }
    
    modifier onlyController() {
        require(hasRole(CONTROLLER_ROLE, msg.sender), "Caller is not a controller");
        _;
    }
    
    constructor() {
        // Initialize roles for the deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Admin role for the deployer
        _grantRole(MINTER_ROLE, msg.sender);         // Minter role for the deployer
        _grantRole(BURNER_ROLE, msg.sender);         // Burner role for the deployer
        _grantRole(CONTROLLER_ROLE, msg.sender);     // Controller role for the deployer
    }

    function whitelistAddress(address account, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _whitelist[account] = status;
        emit Whitelisted(account, status);
    }
    
    function setController(address account, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (status) {
            grantRole(CONTROLLER_ROLE, account);
        } else {
            revokeRole(CONTROLLER_ROLE, account);
        }
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) onlyWhitelisted(to) {
        totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external onlyWhitelisted(to) returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external onlyWhitelisted(to) returns (bool) {
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Allowance exceeded");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    function setDocument(bytes32 _docName, string memory uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _documents[_docName] = uri;
        emit DocumentAdded(_docName, uri);
    }
    
    function getDocument(bytes32 _docName) external view returns (string memory) {
        return _documents[_docName];
    }
    
    function forceTransfer(address from, address to, uint256 amount) external onlyController {
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit ForcedTransfer(from, to, amount);
    }
}
