// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ReliefStablecoin
 * @dev ERC-20 stablecoin pegged 1:1 to INR (notional) for disaster relief distribution.
 * 
 * HUMANITARIAN USE CASE:
 * This stablecoin represents a digital form of Indian Rupee that can be:
 * - Minted by the Relief Authority (Admin) and distributed to disaster-affected families
 * - Spent at approved local merchants for essential goods (food, health, shelter, fuel)
 * - Tracked transparently on-chain for accountability
 * 
 * SECURITY ASSUMPTIONS:
 * - Only the Admin (owner) can mint/burn tokens
 * - In production, this would integrate with real KYC/AML systems
 * - The ProgramManager contract is authorized to move tokens for in-app payments
 */
contract ReliefStablecoin is ERC20, Ownable, Pausable {
    // The ProgramManager contract that can move tokens on behalf of users
    address public programManager;
    
    // Total supply cap (optional, for budget controls)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Events
    event ProgramManagerUpdated(address indexed oldManager, address indexed newManager);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    constructor() ERC20("ReliefCoin INR", "RINR") Ownable(msg.sender) {
        // Initial supply is zero - tokens are minted as programs are funded
    }
    
    /**
     * @dev Sets the ProgramManager contract address
     * @param _programManager Address of the ProgramManager contract
     * 
     * SECURITY: Only admin can set this. In production, this should be
     * a verified, audited contract address.
     */
    function setProgramManager(address _programManager) external onlyOwner {
        require(_programManager != address(0), "Invalid address");
        address oldManager = programManager;
        programManager = _programManager;
        emit ProgramManagerUpdated(oldManager, _programManager);
    }
    
    /**
     * @dev Mints new tokens to an address
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     * @param reason Description of why tokens are being minted
     * 
     * USE CASES:
     * - Funding a disaster relief program
     * - Donor deposits
     * - Initial budget allocation
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyOwner whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burns tokens from an address (with approval)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     * @param reason Description of why tokens are being burned
     * 
     * USE CASES:
     * - Clawback of unused tokens after program ends
     * - Merchant cash-out (tokens burned, fiat paid)
     * - Program closure cleanup
     */
    function burn(address from, uint256 amount, string calldata reason) external onlyOwner whenNotPaused {
        require(from != address(0), "Cannot burn from zero address");
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }
    
    /**
     * @dev Allows ProgramManager to transfer tokens on behalf of users
     * This enables in-app QR payments without requiring users to sign each transaction
     * 
     * @param from Beneficiary address
     * @param to Merchant address
     * @param amount Amount to transfer
     * 
     * SECURITY: In production, additional verification would be needed:
     * - Biometric confirmation
     * - PIN verification
     * - Transaction limits
     */
    function transferForPayment(address from, address to, uint256 amount) external whenNotPaused {
        require(msg.sender == programManager, "Only ProgramManager can call");
        require(from != address(0) && to != address(0), "Invalid addresses");
        _transfer(from, to, amount);
    }
    
    /**
     * @dev Pauses all token transfers (emergency use)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override to add pause functionality
     */
    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
    
    /**
     * @dev Returns token decimals (18 for compatibility, but represents INR paisa)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
