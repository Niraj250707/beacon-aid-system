# ReliefChain Smart Contracts

Smart contracts for the Emergency & Disaster Relief Stablecoin System.

## Overview

This project implements a blockchain-based disaster relief distribution system with three main contracts:

### 1. ReliefStablecoin (RINR)
An ERC-20 stablecoin pegged 1:1 to Indian Rupee (notional) for disaster relief distribution.

**Features:**
- Only Admin (Relief Authority) can mint/burn tokens
- ProgramManager contract authorized to move tokens for payments
- Pausable for emergency situations
- Maximum supply cap of 1 billion tokens

### 2. ProgramManager
Manages disaster relief programs, beneficiaries, merchants, and payments.

**Features:**
- Program CRUD with status management
- Beneficiary registration with off-chain KYC hash
- Merchant whitelisting by category (Food, Health, Shelter, Fuel, Other)
- Batch token airdrops to beneficiaries
- Spend rules: daily limits, program dates, merchant verification
- Post-program clawback of unused funds

### 3. DonorDAO
Simplified DAO for donor governance.

**Features:**
- Donors receive voting power proportional to donations
- Proposal creation for program parameter changes
- 7-day voting period with 10% quorum requirement
- Automatic proposal execution on success

## Setup

```bash
cd contracts
npm install
```

## Compile

```bash
npm run compile
```

## Test

```bash
npm run test
```

## Deploy

### Local Development
```bash
npm run deploy:local
```

### Testnet (Polygon Amoy)
```bash
# Set environment variables first
export PRIVATE_KEY=your_private_key
export AMOY_RPC_URL=https://rpc-amoy.polygon.technology

npm run deploy:amoy
```

### Testnet (Sepolia)
```bash
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key

npm run deploy:sepolia
```

## Seed Data

After deployment, seed sample data:

```bash
export STABLECOIN_ADDRESS=0x...
export PROGRAM_MANAGER_ADDRESS=0x...

npm run seed -- --network amoy
```

## Security Considerations

### Production Requirements
- **KYC Integration**: The `offChainHash` should link to verified government ID systems (Aadhaar, etc.)
- **Multi-sig Admin**: Replace single admin with multi-signature governance
- **Audit**: All contracts should be professionally audited before mainnet deployment
- **Rate Limiting**: Add cooldown periods for large transactions
- **Emergency Contacts**: Maintain list of authorized personnel for pause/unpause

### Current Limitations (Demo)
- Single admin control (should be multi-sig in production)
- Simplified KYC verification (hash only)
- No integration with real identity systems
- Clawback mechanism is admin-controlled

## Contract Architecture

```
ReliefStablecoin (ERC-20)
    ├── Owned by Admin (Relief Authority)
    ├── Authorizes ProgramManager for transfers
    └── Supports pause/unpause

ProgramManager
    ├── Creates/manages disaster relief programs
    ├── Registers beneficiaries with KYC hash
    ├── Registers merchants by category
    ├── Handles token airdrops
    ├── Processes beneficiary → merchant payments
    └── Claws back unused tokens post-program

DonorDAO
    ├── Accepts donor deposits
    ├── Grants voting power
    ├── Creates/manages proposals
    └── Executes approved changes
```

## Events for Analytics

All major actions emit events for off-chain analytics:
- `ProgramCreated`, `ProgramUpdated`, `ProgramClosed`
- `BeneficiaryRegistered`, `MerchantRegistered`
- `TokensAirdropped`, `MerchantPaid`
- `TokensClawedBack`
- `DonationReceived`, `VoteCast`, `ProposalExecuted`

## License

MIT
