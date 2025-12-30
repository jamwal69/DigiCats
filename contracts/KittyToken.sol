// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title KittyToken
 * @dev Utility token for the CryptoKitties ecosystem
 * Used for breeding fees, battle entries, staking rewards, and governance
 */
contract KittyToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    uint256 public constant INITIAL_USER_ALLOCATION = 100 * 10**18; // 100 tokens per user
    
    mapping(address => bool) public hasClaimedInitial;
    mapping(address => bool) public authorizedMinters;
    
    event InitialTokensClaimed(address indexed user, uint256 amount);
    event MinterAuthorized(address indexed minter, bool status);
    
    constructor() ERC20("KittyToken", "KITTY") Ownable(msg.sender) {
        // Mint initial supply to contract owner for distribution
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Allows users to claim their initial allocation of tokens
     */
    function claimInitialTokens() external {
        require(!hasClaimedInitial[msg.sender], "Already claimed initial tokens");
        require(balanceOf(owner()) >= INITIAL_USER_ALLOCATION, "Insufficient tokens for distribution");
        
        hasClaimedInitial[msg.sender] = true;
        _transfer(owner(), msg.sender, INITIAL_USER_ALLOCATION);
        
        emit InitialTokensClaimed(msg.sender, INITIAL_USER_ALLOCATION);
    }
    
    /**
     * @dev Authorize or deauthorize a contract to mint tokens
     */
    function setMinterAuthorization(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }
    
    /**
     * @dev Mint tokens for rewards and other use cases
     */
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from any address (for deflationary mechanisms)
     */
    function burnFrom(address account, uint256 amount) public override {
        require(authorizedMinters[msg.sender] || account == msg.sender, "Not authorized to burn");
        if (account != msg.sender) {
            _spendAllowance(account, msg.sender, amount);
        }
        _burn(account, amount);
    }
}
