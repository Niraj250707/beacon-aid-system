// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ReliefStablecoin.sol";

/**
 * @title ProgramManager
 * @dev Manages disaster relief programs, beneficiaries, merchants, and payments.
 * 
 * HUMANITARIAN USE CASE:
 * This contract is the core of the disaster relief system, handling:
 * - Program creation and management by government/NGO admins
 * - Beneficiary enrollment with off-chain KYC verification
 * - Merchant whitelisting by spending category
 * - Token airdrops to beneficiaries
 * - Controlled spending with daily/total limits
 * - Post-program clawback of unused funds
 * 
 * SECURITY CONSIDERATIONS:
 * - Role-based access control for different user types
 * - Spending limits prevent abuse
 * - Region and category restrictions ensure funds reach intended recipients
 * - In production, integrate with government identity systems (Aadhaar, etc.)
 */
contract ProgramManager is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FIELD_AGENT_ROLE = keccak256("FIELD_AGENT_ROLE");
    
    // Reference to the stablecoin contract
    ReliefStablecoin public stablecoin;
    
    // Merchant categories
    enum Category { Food, Health, Shelter, Fuel, Other }
    
    // Program status
    enum ProgramStatus { Draft, Active, Paused, Completed, Closed }
    
    // Disaster types
    enum DisasterType { Flood, Earthquake, Cyclone, Drought, Pandemic, Fire, Other }
    
    // Program structure
    struct Program {
        bytes32 id;
        string name;
        DisasterType disasterType;
        string state;
        string district;
        uint256 startDate;
        uint256 endDate;
        uint256 totalBudget;
        uint256 distributedAmount;
        uint256 perHouseholdAllocation;
        uint256 dailyLimit;
        ProgramStatus status;
        uint256 beneficiaryCount;
        uint256 merchantCount;
    }
    
    // Beneficiary structure
    struct Beneficiary {
        address wallet;
        bytes32 programId;
        bytes32 offChainHash; // Hash of KYC data stored off-chain
        string region;
        uint256 totalReceived;
        uint256 totalSpent;
        uint256 dailySpent;
        uint256 lastSpendDate;
        bool isActive;
    }
    
    // Merchant structure
    struct Merchant {
        address wallet;
        bytes32 programId;
        Category category;
        string region;
        uint256 totalReceived;
        bool isActive;
    }
    
    // Storage
    mapping(bytes32 => Program) public programs;
    mapping(address => mapping(bytes32 => Beneficiary)) public beneficiaries; // wallet => programId => Beneficiary
    mapping(address => mapping(bytes32 => Merchant)) public merchants; // wallet => programId => Merchant
    mapping(bytes32 => address[]) public programBeneficiaries;
    mapping(bytes32 => address[]) public programMerchants;
    
    bytes32[] public programIds;
    
    // Events
    event ProgramCreated(bytes32 indexed programId, string name, DisasterType disasterType, string state);
    event ProgramUpdated(bytes32 indexed programId, ProgramStatus status);
    event ProgramClosed(bytes32 indexed programId, uint256 remainingFunds);
    event BeneficiaryRegistered(bytes32 indexed programId, address indexed wallet, bytes32 offChainHash);
    event MerchantRegistered(bytes32 indexed programId, address indexed wallet, Category category);
    event TokensAirdropped(bytes32 indexed programId, uint256 recipientCount, uint256 totalAmount);
    event MerchantPaid(bytes32 indexed programId, address indexed beneficiary, address indexed merchant, uint256 amount, Category category);
    event TokensClawedBack(bytes32 indexed programId, address indexed from, uint256 amount);
    
    constructor(address _stablecoin) {
        stablecoin = ReliefStablecoin(_stablecoin);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    // ============ Program Management ============
    
    /**
     * @dev Creates a new disaster relief program
     * @param name Program name
     * @param disasterType Type of disaster
     * @param state State/province
     * @param district District within state
     * @param startDate Program start timestamp
     * @param endDate Program end timestamp
     * @param totalBudget Total budget in tokens
     * @param perHouseholdAllocation Amount each household receives
     * @param dailyLimit Daily spending limit per beneficiary
     */
    function createProgram(
        string calldata name,
        DisasterType disasterType,
        string calldata state,
        string calldata district,
        uint256 startDate,
        uint256 endDate,
        uint256 totalBudget,
        uint256 perHouseholdAllocation,
        uint256 dailyLimit
    ) external onlyRole(ADMIN_ROLE) returns (bytes32) {
        require(startDate < endDate, "Invalid dates");
        require(totalBudget > 0, "Budget must be positive");
        require(perHouseholdAllocation > 0, "Allocation must be positive");
        
        bytes32 programId = keccak256(abi.encodePacked(name, block.timestamp, msg.sender));
        
        programs[programId] = Program({
            id: programId,
            name: name,
            disasterType: disasterType,
            state: state,
            district: district,
            startDate: startDate,
            endDate: endDate,
            totalBudget: totalBudget,
            distributedAmount: 0,
            perHouseholdAllocation: perHouseholdAllocation,
            dailyLimit: dailyLimit,
            status: ProgramStatus.Draft,
            beneficiaryCount: 0,
            merchantCount: 0
        });
        
        programIds.push(programId);
        
        emit ProgramCreated(programId, name, disasterType, state);
        return programId;
    }
    
    /**
     * @dev Updates program status
     */
    function updateProgramStatus(bytes32 programId, ProgramStatus status) external onlyRole(ADMIN_ROLE) {
        require(programs[programId].totalBudget > 0, "Program not found");
        programs[programId].status = status;
        emit ProgramUpdated(programId, status);
    }
    
    /**
     * @dev Closes a program and returns remaining funds info
     */
    function closeProgram(bytes32 programId) external onlyRole(ADMIN_ROLE) {
        Program storage program = programs[programId];
        require(program.totalBudget > 0, "Program not found");
        require(block.timestamp > program.endDate, "Program not ended");
        
        uint256 remaining = program.totalBudget - program.distributedAmount;
        program.status = ProgramStatus.Closed;
        
        emit ProgramClosed(programId, remaining);
    }
    
    // ============ Beneficiary Management ============
    
    /**
     * @dev Registers a beneficiary for a program
     * @param programId Program identifier
     * @param wallet Beneficiary's wallet address
     * @param offChainHash Hash of KYC data (actual data stored off-chain)
     * @param region Beneficiary's region for verification
     * 
     * SECURITY: In production, offChainHash would link to verified government ID
     */
    function registerBeneficiary(
        bytes32 programId,
        address wallet,
        bytes32 offChainHash,
        string calldata region
    ) external onlyRole(ADMIN_ROLE) {
        require(programs[programId].totalBudget > 0, "Program not found");
        require(wallet != address(0), "Invalid wallet");
        require(!beneficiaries[wallet][programId].isActive, "Already registered");
        
        beneficiaries[wallet][programId] = Beneficiary({
            wallet: wallet,
            programId: programId,
            offChainHash: offChainHash,
            region: region,
            totalReceived: 0,
            totalSpent: 0,
            dailySpent: 0,
            lastSpendDate: 0,
            isActive: true
        });
        
        programBeneficiaries[programId].push(wallet);
        programs[programId].beneficiaryCount++;
        
        emit BeneficiaryRegistered(programId, wallet, offChainHash);
    }
    
    /**
     * @dev Registers a merchant for a program
     * @param programId Program identifier
     * @param wallet Merchant's wallet address
     * @param category Spending category (Food, Health, etc.)
     * @param region Merchant's operating region
     */
    function registerMerchant(
        bytes32 programId,
        address wallet,
        Category category,
        string calldata region
    ) external onlyRole(ADMIN_ROLE) {
        require(programs[programId].totalBudget > 0, "Program not found");
        require(wallet != address(0), "Invalid wallet");
        require(!merchants[wallet][programId].isActive, "Already registered");
        
        merchants[wallet][programId] = Merchant({
            wallet: wallet,
            programId: programId,
            category: category,
            region: region,
            totalReceived: 0,
            isActive: true
        });
        
        programMerchants[programId].push(wallet);
        programs[programId].merchantCount++;
        
        emit MerchantRegistered(programId, wallet, category);
    }
    
    // ============ Token Distribution ============
    
    /**
     * @dev Airdrops tokens to multiple beneficiaries
     * @param programId Program identifier
     * @param beneficiaryList Array of beneficiary addresses
     * @param amountPerUser Amount each beneficiary receives
     * 
     * USE CASE: Mass distribution after disaster declaration
     */
    function airdropToBeneficiaries(
        bytes32 programId,
        address[] calldata beneficiaryList,
        uint256 amountPerUser
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Program storage program = programs[programId];
        require(program.status == ProgramStatus.Active, "Program not active");
        require(block.timestamp >= program.startDate, "Program not started");
        require(block.timestamp <= program.endDate, "Program ended");
        
        uint256 totalAmount = beneficiaryList.length * amountPerUser;
        require(program.distributedAmount + totalAmount <= program.totalBudget, "Exceeds budget");
        
        for (uint256 i = 0; i < beneficiaryList.length; i++) {
            address beneficiary = beneficiaryList[i];
            require(beneficiaries[beneficiary][programId].isActive, "Beneficiary not registered");
            
            // Transfer tokens from program pool (this contract's balance) to beneficiary
            stablecoin.transferForPayment(address(this), beneficiary, amountPerUser);
            beneficiaries[beneficiary][programId].totalReceived += amountPerUser;
        }
        
        program.distributedAmount += totalAmount;
        
        emit TokensAirdropped(programId, beneficiaryList.length, totalAmount);
    }
    
    // ============ Payment Processing ============
    
    /**
     * @dev Processes a payment from beneficiary to merchant
     * @param programId Program identifier
     * @param beneficiary Beneficiary's address
     * @param merchant Merchant's address
     * @param amount Payment amount
     * 
     * SPEND RULES ENFORCED:
     * - Program must be active and within date range
     * - Merchant must be whitelisted for this program
     * - Daily limit must not be exceeded
     * - Total spending must not exceed received amount
     */
    function payMerchant(
        bytes32 programId,
        address beneficiary,
        address merchant,
        uint256 amount
    ) external nonReentrant {
        Program storage program = programs[programId];
        Beneficiary storage ben = beneficiaries[beneficiary][programId];
        Merchant storage mer = merchants[merchant][programId];
        
        // Validate program
        require(program.status == ProgramStatus.Active, "Program not active");
        require(block.timestamp >= program.startDate && block.timestamp <= program.endDate, "Outside program dates");
        
        // Validate participants
        require(ben.isActive, "Beneficiary not active");
        require(mer.isActive, "Merchant not active");
        
        // Reset daily spending if new day
        if (block.timestamp / 1 days > ben.lastSpendDate / 1 days) {
            ben.dailySpent = 0;
        }
        
        // Check limits
        require(ben.dailySpent + amount <= program.dailyLimit, "Exceeds daily limit");
        require(ben.totalSpent + amount <= ben.totalReceived, "Insufficient balance");
        
        // Process payment
        stablecoin.transferForPayment(beneficiary, merchant, amount);
        
        // Update records
        ben.dailySpent += amount;
        ben.totalSpent += amount;
        ben.lastSpendDate = block.timestamp;
        mer.totalReceived += amount;
        
        emit MerchantPaid(programId, beneficiary, merchant, amount, mer.category);
    }
    
    // ============ Clawback ============
    
    /**
     * @dev Claws back unused tokens after program ends
     * @param programId Program identifier
     * @param addresses Addresses to claw back from
     * 
     * USE CASE: Recover unused funds for future programs
     */
    function clawbackUnused(
        bytes32 programId,
        address[] calldata addresses
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Program storage program = programs[programId];
        require(block.timestamp > program.endDate, "Program not ended");
        
        for (uint256 i = 0; i < addresses.length; i++) {
            address addr = addresses[i];
            uint256 balance = stablecoin.balanceOf(addr);
            
            if (balance > 0) {
                stablecoin.transferForPayment(addr, address(this), balance);
                emit TokensClawedBack(programId, addr, balance);
            }
        }
    }
    
    // ============ View Functions ============
    
    function getProgramCount() external view returns (uint256) {
        return programIds.length;
    }
    
    function getProgramBeneficiaries(bytes32 programId) external view returns (address[] memory) {
        return programBeneficiaries[programId];
    }
    
    function getProgramMerchants(bytes32 programId) external view returns (address[] memory) {
        return programMerchants[programId];
    }
    
    function getBeneficiaryBalance(address wallet, bytes32 programId) external view returns (uint256) {
        Beneficiary storage ben = beneficiaries[wallet][programId];
        return ben.totalReceived - ben.totalSpent;
    }
}
