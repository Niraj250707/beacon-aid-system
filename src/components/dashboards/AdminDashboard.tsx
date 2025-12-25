import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { 
  IndianRupee, 
  Users, 
  Store, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import ProgramCard from '@/components/dashboard/ProgramCard';
import TransactionList from '@/components/dashboard/TransactionList';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import { useWallet } from '@/contexts/WalletContext';
import { 
  mockPrograms, 
  mockTransactions, 
  mockAnalytics,
  formatCurrency 
} from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminDashboard: React.FC = () => {
  // Calculate totals
  const totalBudget = mockPrograms.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalDistributed = mockPrograms.reduce((sum, p) => sum + p.distributedAmount, 0);
  const totalBeneficiaries = mockPrograms.reduce((sum, p) => sum + p.beneficiaryCount, 0);
  const totalMerchants = mockPrograms.reduce((sum, p) => sum + p.merchantCount, 0);
  const activePrograms = mockPrograms.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all disaster relief programs and fund distribution
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Report</Button>
          <Button variant="hero">Create Program</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Total Budget"
          value={formatCurrency(totalBudget)}
          subtitle={`${activePrograms} active programs`}
          icon={IndianRupee}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Distributed"
          value={formatCurrency(totalDistributed)}
          subtitle={`${((totalDistributed / totalBudget) * 100).toFixed(1)}% of total budget`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Beneficiaries"
          value={totalBeneficiaries.toLocaleString()}
          subtitle="Households served"
          icon={Users}
          variant="info"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Merchants"
          value={totalMerchants}
          subtitle="Verified vendors"
          icon={Store}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span>Add Beneficiaries</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Store className="w-5 h-5" />
              <span>Register Merchant</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <IndianRupee className="w-5 h-5" />
              <span>Disburse Tokens</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>View Flagged</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Active Programs</h2>
          <Button variant="ghost" className="gap-2">
            View All <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockPrograms.slice(0, 3).map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts analytics={mockAnalytics} />

      {/* Recent Transactions */}
      <TransactionList 
        transactions={mockTransactions} 
        showProgram 
      />
    </div>
  );
};

export default AdminDashboard;
