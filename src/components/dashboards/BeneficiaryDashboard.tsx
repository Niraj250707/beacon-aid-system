import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Store,
  Calendar,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import TransactionList from '@/components/dashboard/TransactionList';
import QRPayment from '@/components/payment/QRPayment';
import { useWallet } from '@/contexts/WalletContext';
import { 
  mockPrograms, 
  mockTransactions, 
  mockBeneficiaries,
  formatCurrency,
  formatDate
} from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BeneficiaryDashboard: React.FC = () => {
  const { wallet } = useWallet();
  
  // Mock beneficiary data
  const beneficiary = mockBeneficiaries[0];
  const enrolledProgram = mockPrograms.find(p => p.id === beneficiary.programId);
  const userTransactions = mockTransactions.filter(
    tx => tx.fromAddress === beneficiary.walletAddress || tx.toAddress === beneficiary.walletAddress
  );

  const spentPercentage = (beneficiary.totalSpent / beneficiary.totalReceived) * 100;
  const dailyLimitPercentage = (beneficiary.dailySpent / (enrolledProgram?.dailyLimit || 5000)) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {beneficiary.name}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your relief funds and make payments to verified merchants
          </p>
        </div>
        <Badge variant="active" className="w-fit">
          <Shield className="w-3 h-3 mr-1" />
          Verified Beneficiary
        </Badge>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3 stagger-children">
        <StatCard
          title="Available Balance"
          value={formatCurrency(beneficiary.totalReceived - beneficiary.totalSpent)}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Total Received"
          value={formatCurrency(beneficiary.totalReceived)}
          subtitle={`From ${enrolledProgram?.name}`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(beneficiary.totalSpent)}
          subtitle={`${spentPercentage.toFixed(0)}% utilized`}
          icon={Store}
          variant="info"
        />
      </div>

      {/* Enrolled Program Card */}
      {enrolledProgram && (
        <Card variant="glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Enrolled Program</CardTitle>
                <CardDescription>{enrolledProgram.name}</CardDescription>
              </div>
              <Badge variant="active">{enrolledProgram.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Allocation per Household</p>
                <p className="text-xl font-semibold">{formatCurrency(enrolledProgram.perHouseholdAllocation)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Program Duration</p>
                <p className="text-xl font-semibold">
                  {formatDate(enrolledProgram.startDate)} - {formatDate(enrolledProgram.endDate)}
                </p>
              </div>
            </div>

            {/* Spending Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Funds Utilized</span>
                <span className="font-medium">{spentPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={spentPercentage} className="h-2" />
            </div>

            {/* Daily Limit */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Limit Used</span>
                <span className="font-medium">
                  {formatCurrency(beneficiary.dailySpent)} / {formatCurrency(enrolledProgram.dailyLimit)}
                </span>
              </div>
              <Progress value={dailyLimitPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="pay" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="pay">Pay Merchant</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="pay">
          <QRPayment />
        </TabsContent>

        <TabsContent value="history">
          <TransactionList 
            transactions={userTransactions} 
            userAddress={beneficiary.walletAddress}
            showProgram
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BeneficiaryDashboard;
