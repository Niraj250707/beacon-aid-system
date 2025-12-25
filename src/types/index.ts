// User roles in the system
export type UserRole = 'ADMIN' | 'DONOR' | 'BENEFICIARY' | 'MERCHANT' | 'FIELD_AGENT';

// Merchant categories for spending classification
export type MerchantCategory = 'Food' | 'Health' | 'Shelter' | 'Fuel' | 'Other';

// Program status
export type ProgramStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CLOSED';

// Disaster types
export type DisasterType = 'FLOOD' | 'EARTHQUAKE' | 'CYCLONE' | 'DROUGHT' | 'PANDEMIC' | 'FIRE' | 'OTHER';

// Risk levels for fraud detection
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// User interface
export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  state?: string;
  district?: string;
  village?: string;
  kycHash?: string;
  kycVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Disaster relief program
export interface Program {
  id: string;
  name: string;
  description: string;
  disasterType: DisasterType;
  state: string;
  district: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  distributedAmount: number;
  perHouseholdAllocation: number;
  dailyLimit: number;
  status: ProgramStatus;
  beneficiaryCount: number;
  merchantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Beneficiary details
export interface Beneficiary {
  id: string;
  userId: string;
  programId: string;
  walletAddress: string;
  name: string;
  householdSize: number;
  totalReceived: number;
  totalSpent: number;
  dailySpent: number;
  lastTransactionDate?: Date;
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED';
  enrolledAt: Date;
}

// Merchant details
export interface Merchant {
  id: string;
  userId: string;
  programId: string;
  walletAddress: string;
  businessName: string;
  category: MerchantCategory;
  totalReceived: number;
  totalCashedOut: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReason?: string;
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';
  registeredAt: Date;
}

// Transaction record
export interface Transaction {
  id: string;
  programId: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  type: 'AIRDROP' | 'PAYMENT' | 'CASHOUT' | 'CLAWBACK' | 'DONATION';
  category?: MerchantCategory;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

// Donor information
export interface Donor {
  id: string;
  userId: string;
  walletAddress: string;
  totalDonated: number;
  votingPower: number;
  programs: string[];
  createdAt: Date;
}

// DAO Proposal
export interface Proposal {
  id: string;
  programId: string;
  title: string;
  description: string;
  proposerAddress: string;
  proposedChange: {
    field: string;
    currentValue: number;
    proposedValue: number;
  };
  votesFor: number;
  votesAgainst: number;
  status: 'PENDING' | 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
  createdAt: Date;
  votingEndsAt: Date;
}

// Analytics data
export interface ProgramAnalytics {
  programId: string;
  totalDonated: number;
  totalDistributed: number;
  totalSpent: number;
  remainingBudget: number;
  beneficiariesServed: number;
  merchantsActive: number;
  spendingByCategory: Record<MerchantCategory, number>;
  spendingByRegion: Record<string, number>;
  dailyTransactions: { date: string; amount: number; count: number }[];
}

// Wallet state
export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
  chainId: number | null;
  isCorrectNetwork: boolean;
}
