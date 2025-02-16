// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC1400RealEstate is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    mapping(address => bool) private _whitelist;
    
    event Whitelisted(address indexed account, bool status);

    modifier onlyWhitelisted(address account) {
        require(_whitelist[account], "Address not whitelisted");
        _;
    }

    constructor() ERC20("Real Estate Security Token", "REST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(CONTROLLER_ROLE, msg.sender);
    }

    function whitelistAddress(address account, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _whitelist[account] = status;
        emit Whitelisted(account, status);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) onlyWhitelisted(to) {
        _mint(to, amount);
    }

    function burn(uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
    }

    function transfer(address to, uint256 amount) public override onlyWhitelisted(to) returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override onlyWhitelisted(to) returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
