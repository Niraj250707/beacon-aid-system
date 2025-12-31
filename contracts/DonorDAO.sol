// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ReliefStablecoin.sol";
import "./ProgramManager.sol";

/**
 * @title DonorDAO
 * @dev Simplified DAO for donor governance of disaster relief programs.
 * 
 * HUMANITARIAN USE CASE:
 * - Donors deposit stablecoins to fund relief programs
 * - In return, they receive voting power proportional to their donation
 * - Donors can propose and vote on program changes (budget increases, extensions)
 * - Successful proposals automatically update program parameters
 * 
 * GOVERNANCE MODEL:
 * - 1 token donated = 1 vote
 * - Proposals require quorum (10% of total voting power)
 * - Simple majority wins
 * - 7-day voting period
 * 
 * SECURITY NOTES:
 * - This is a simplified model for demonstration
 * - Production systems would need more sophisticated voting mechanisms
 * - Consider adding delegation, time-locks, and multi-sig requirements
 */
contract DonorDAO is Ownable, ReentrancyGuard {
    ReliefStablecoin public stablecoin;
    ProgramManager public programManager;
    
    // Voting period in seconds (7 days)
    uint256 public constant VOTING_PERIOD = 7 days;
    // Quorum percentage (10%)
    uint256 public constant QUORUM_PERCENTAGE = 10;
    
    // Proposal status
    enum ProposalStatus { Pending, Active, Passed, Rejected, Executed }
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        bytes32 programId;
        string title;
        string description;
        address proposer;
        string field; // Field to change (e.g., "perHouseholdAllocation", "endDate")
        uint256 currentValue;
        uint256 proposedValue;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 createdAt;
        uint256 votingEndsAt;
        ProposalStatus status;
        mapping(address => bool) hasVoted;
    }
    
    // Donor structure
    struct Donor {
        uint256 totalDonated;
        uint256 votingPower;
        mapping(bytes32 => uint256) programDonations;
    }
    
    // Storage
    mapping(address => Donor) public donors;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256 public totalVotingPower;
    
    // Treasury for each program
    mapping(bytes32 => uint256) public programTreasury;
    
    // Events
    event DonationReceived(address indexed donor, bytes32 indexed programId, uint256 amount);
    event VotingPowerGranted(address indexed donor, uint256 power);
    event ProposalCreated(uint256 indexed proposalId, bytes32 indexed programId, string title, address proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event WithdrawalProcessed(address indexed donor, uint256 amount);
    
    constructor(address _stablecoin, address _programManager) Ownable(msg.sender) {
        stablecoin = ReliefStablecoin(_stablecoin);
        programManager = ProgramManager(_programManager);
    }
    
    // ============ Donation Functions ============
    
    /**
     * @dev Allows donors to deposit stablecoins for a specific program
     * @param programId Program to fund
     * @param amount Amount to donate
     * 
     * Donors receive voting power equal to their donation amount
     */
    function donate(bytes32 programId, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(stablecoin.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to DAO treasury
        stablecoin.transferFrom(msg.sender, address(this), amount);
        
        // Update donor records
        Donor storage donor = donors[msg.sender];
        donor.totalDonated += amount;
        donor.votingPower += amount;
        donor.programDonations[programId] += amount;
        
        // Update program treasury
        programTreasury[programId] += amount;
        totalVotingPower += amount;
        
        emit DonationReceived(msg.sender, programId, amount);
        emit VotingPowerGranted(msg.sender, amount);
    }
    
    // ============ Proposal Functions ============
    
    /**
     * @dev Creates a new proposal to modify a program parameter
     * @param programId Program to modify
     * @param title Proposal title
     * @param description Detailed description
     * @param field Parameter to change
     * @param currentValue Current value of the parameter
     * @param proposedValue New proposed value
     */
    function createProposal(
        bytes32 programId,
        string calldata title,
        string calldata description,
        string calldata field,
        uint256 currentValue,
        uint256 proposedValue
    ) external returns (uint256) {
        require(donors[msg.sender].votingPower > 0, "Must be a donor to propose");
        require(bytes(title).length > 0, "Title required");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        
        proposal.id = proposalCount;
        proposal.programId = programId;
        proposal.title = title;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.field = field;
        proposal.currentValue = currentValue;
        proposal.proposedValue = proposedValue;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.createdAt = block.timestamp;
        proposal.votingEndsAt = block.timestamp + VOTING_PERIOD;
        proposal.status = ProposalStatus.Active;
        
        emit ProposalCreated(proposalCount, programId, title, msg.sender);
        return proposalCount;
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId Proposal to vote on
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp < proposal.votingEndsAt, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 voterPower = donors[msg.sender].votingPower;
        require(voterPower > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += voterPower;
        } else {
            proposal.votesAgainst += voterPower;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voterPower);
    }
    
    /**
     * @dev Execute a proposal after voting period ends
     * @param proposalId Proposal to execute
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.votingEndsAt, "Voting not ended");
        
        // Check quorum
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 quorumRequired = (totalVotingPower * QUORUM_PERCENTAGE) / 100;
        
        bool passed = false;
        if (totalVotes >= quorumRequired && proposal.votesFor > proposal.votesAgainst) {
            proposal.status = ProposalStatus.Passed;
            passed = true;
            // In a real implementation, this would call programManager to update the value
            // For demo purposes, we just emit an event
        } else {
            proposal.status = ProposalStatus.Rejected;
        }
        
        emit ProposalExecuted(proposalId, passed);
    }
    
    // ============ View Functions ============
    
    function getDonorInfo(address donor) external view returns (uint256 totalDonated, uint256 votingPower) {
        return (donors[donor].totalDonated, donors[donor].votingPower);
    }
    
    function getProposalVotes(uint256 proposalId) external view returns (uint256 votesFor, uint256 votesAgainst) {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.votesFor, proposal.votesAgainst);
    }
    
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    function getProgramTreasury(bytes32 programId) external view returns (uint256) {
        return programTreasury[programId];
    }
}
