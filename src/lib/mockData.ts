import { 
  Program, 
  Beneficiary, 
  Merchant, 
  Transaction, 
  Donor, 
  Proposal,
  ProgramAnalytics 
} from '@/types';

// Mock Programs
export const mockPrograms: Program[] = [
  {
    id: 'prog-001',
    name: 'Kerala Flood Relief 2024',
    description: 'Emergency relief for flood-affected families in Kerala',
    disasterType: 'FLOOD',
    state: 'Kerala',
    district: 'Wayanad',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-12-31'),
    totalBudget: 50000000,
    distributedAmount: 32500000,
    perHouseholdAllocation: 25000,
    dailyLimit: 5000,
    status: 'ACTIVE',
    beneficiaryCount: 1300,
    merchantCount: 45,
    createdAt: new Date('2024-07-28'),
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: 'prog-002',
    name: 'Odisha Cyclone Recovery',
    description: 'Support for cyclone Amphan affected communities',
    disasterType: 'CYCLONE',
    state: 'Odisha',
    district: 'Puri',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-11-30'),
    totalBudget: 75000000,
    distributedAmount: 68000000,
    perHouseholdAllocation: 30000,
    dailyLimit: 6000,
    status: 'ACTIVE',
    beneficiaryCount: 2267,
    merchantCount: 78,
    createdAt: new Date('2024-06-10'),
    updatedAt: new Date('2024-12-18'),
  },
  {
    id: 'prog-003',
    name: 'Gujarat Drought Assistance',
    description: 'Water and livelihood support for drought-hit regions',
    disasterType: 'DROUGHT',
    state: 'Gujarat',
    district: 'Kutch',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-09-30'),
    totalBudget: 40000000,
    distributedAmount: 40000000,
    perHouseholdAllocation: 20000,
    dailyLimit: 4000,
    status: 'COMPLETED',
    beneficiaryCount: 2000,
    merchantCount: 52,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-10-01'),
  },
];

// Mock Beneficiaries
export const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'ben-001',
    userId: 'user-101',
    programId: 'prog-001',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1c2d1',
    name: 'Ramesh Kumar',
    householdSize: 5,
    totalReceived: 25000,
    totalSpent: 18500,
    dailySpent: 2500,
    lastTransactionDate: new Date('2024-12-20'),
    status: 'ACTIVE',
    enrolledAt: new Date('2024-08-05'),
  },
  {
    id: 'ben-002',
    userId: 'user-102',
    programId: 'prog-001',
    walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    name: 'Lakshmi Devi',
    householdSize: 4,
    totalReceived: 25000,
    totalSpent: 22000,
    dailySpent: 0,
    lastTransactionDate: new Date('2024-12-19'),
    status: 'ACTIVE',
    enrolledAt: new Date('2024-08-06'),
  },
  {
    id: 'ben-003',
    userId: 'user-103',
    programId: 'prog-001',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    name: 'Mohammed Ali',
    householdSize: 6,
    totalReceived: 25000,
    totalSpent: 15000,
    dailySpent: 1000,
    lastTransactionDate: new Date('2024-12-20'),
    status: 'ACTIVE',
    enrolledAt: new Date('2024-08-07'),
  },
];

// Mock Merchants
export const mockMerchants: Merchant[] = [
  {
    id: 'mer-001',
    userId: 'user-201',
    programId: 'prog-001',
    walletAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    businessName: 'Krishna Groceries',
    category: 'Food',
    totalReceived: 450000,
    totalCashedOut: 400000,
    riskScore: 15,
    riskLevel: 'LOW',
    status: 'ACTIVE',
    registeredAt: new Date('2024-08-03'),
  },
  {
    id: 'mer-002',
    userId: 'user-202',
    programId: 'prog-001',
    walletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    businessName: 'Shanti Medical Store',
    category: 'Health',
    totalReceived: 280000,
    totalCashedOut: 250000,
    riskScore: 22,
    riskLevel: 'LOW',
    status: 'ACTIVE',
    registeredAt: new Date('2024-08-03'),
  },
  {
    id: 'mer-003',
    userId: 'user-203',
    programId: 'prog-001',
    walletAddress: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148',
    businessName: 'Quick Mart Express',
    category: 'Food',
    totalReceived: 180000,
    totalCashedOut: 150000,
    riskScore: 68,
    riskLevel: 'HIGH',
    riskReason: 'Multiple small transactions from same beneficiary within 10 minutes',
    status: 'FLAGGED',
    registeredAt: new Date('2024-08-04'),
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    programId: 'prog-001',
    fromAddress: '0x0000000000000000000000000000000000000000',
    toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1c2d1',
    amount: 25000,
    type: 'AIRDROP',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 12345678,
    timestamp: new Date('2024-08-05T10:30:00'),
    status: 'CONFIRMED',
  },
  {
    id: 'tx-002',
    programId: 'prog-001',
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1c2d1',
    toAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    amount: 2500,
    type: 'PAYMENT',
    category: 'Food',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 12345690,
    timestamp: new Date('2024-12-20T14:25:00'),
    status: 'CONFIRMED',
  },
  {
    id: 'tx-003',
    programId: 'prog-001',
    fromAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    toAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    amount: 3500,
    type: 'PAYMENT',
    category: 'Health',
    txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    blockNumber: 12345695,
    timestamp: new Date('2024-12-19T16:45:00'),
    status: 'CONFIRMED',
  },
];

// Mock Donors
export const mockDonors: Donor[] = [
  {
    id: 'don-001',
    userId: 'user-301',
    walletAddress: '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB',
    totalDonated: 5000000,
    votingPower: 5000,
    programs: ['prog-001', 'prog-002'],
    createdAt: new Date('2024-07-30'),
  },
  {
    id: 'don-002',
    userId: 'user-302',
    walletAddress: '0x583031D1113aD414F02576BD6afaBfb302140225',
    totalDonated: 2500000,
    votingPower: 2500,
    programs: ['prog-001'],
    createdAt: new Date('2024-08-02'),
  },
];

// Mock Proposals
export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    programId: 'prog-001',
    title: 'Increase per-household allocation by 20%',
    description: 'Due to rising costs, we propose increasing the allocation from ₹25,000 to ₹30,000 per household.',
    proposerAddress: '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB',
    proposedChange: {
      field: 'perHouseholdAllocation',
      currentValue: 25000,
      proposedValue: 30000,
    },
    votesFor: 4500,
    votesAgainst: 1200,
    status: 'ACTIVE',
    createdAt: new Date('2024-12-15'),
    votingEndsAt: new Date('2024-12-25'),
  },
  {
    id: 'prop-002',
    programId: 'prog-001',
    title: 'Extend program duration by 2 months',
    description: 'Extend the Kerala Flood Relief program until February 2025 to cover more families.',
    proposerAddress: '0x583031D1113aD414F02576BD6afaBfb302140225',
    proposedChange: {
      field: 'endDate',
      currentValue: 1735689599000,
      proposedValue: 1740873599000,
    },
    votesFor: 3200,
    votesAgainst: 800,
    status: 'PASSED',
    createdAt: new Date('2024-12-10'),
    votingEndsAt: new Date('2024-12-20'),
  },
];

// Mock Analytics
export const mockAnalytics: ProgramAnalytics = {
  programId: 'prog-001',
  totalDonated: 50000000,
  totalDistributed: 32500000,
  totalSpent: 28000000,
  remainingBudget: 17500000,
  beneficiariesServed: 1300,
  merchantsActive: 45,
  spendingByCategory: {
    Food: 14000000,
    Health: 7000000,
    Shelter: 4500000,
    Fuel: 1800000,
    Other: 700000,
  },
  spendingByRegion: {
    'Wayanad': 18000000,
    'Kozhikode': 6500000,
    'Malappuram': 3500000,
  },
  dailyTransactions: [
    { date: '2024-12-14', amount: 1250000, count: 342 },
    { date: '2024-12-15', amount: 1450000, count: 398 },
    { date: '2024-12-16', amount: 980000, count: 267 },
    { date: '2024-12-17', amount: 1320000, count: 356 },
    { date: '2024-12-18', amount: 1580000, count: 412 },
    { date: '2024-12-19', amount: 1420000, count: 378 },
    { date: '2024-12-20', amount: 1650000, count: 445 },
  ],
};

// Helper functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
