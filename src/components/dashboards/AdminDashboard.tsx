import React, { useState } from 'react';
import { 
  IndianRupee, 
  Users, 
  Store, 
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import ProgramCard from '@/components/dashboard/ProgramCard';
import TransactionList from '@/components/dashboard/TransactionList';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import { 
  mockPrograms, 
  mockTransactions, 
  mockAnalytics,
  formatCurrency 
} from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { exportTransactions, exportBeneficiaries, exportMerchants } from '@/lib/csvExport';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Calculate totals
  const totalBudget = mockPrograms.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalDistributed = mockPrograms.reduce((sum, p) => sum + p.distributedAmount, 0);
  const totalBeneficiaries = mockPrograms.reduce((sum, p) => sum + p.beneficiaryCount, 0);
  const totalMerchants = mockPrograms.reduce((sum, p) => sum + p.merchantCount, 0);
  const activePrograms = mockPrograms.filter(p => p.status === 'ACTIVE').length;

  const handleExportTransactions = async () => {
    setIsExporting('transactions');
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        exportTransactions(data);
        toast.success('Transactions exported successfully');
      } else {
        toast.info('No transactions to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportBeneficiaries = async () => {
    setIsExporting('beneficiaries');
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        exportBeneficiaries(data);
        toast.success('Beneficiaries exported successfully');
      } else {
        toast.info('No beneficiaries to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export beneficiaries');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportMerchants = async () => {
    setIsExporting('merchants');
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        exportMerchants(data);
        toast.success('Merchants exported successfully');
      } else {
        toast.info('No merchants to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export merchants');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of all disaster relief programs and fund distribution
          </p>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export as CSV</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleExportTransactions}
                disabled={isExporting !== null}
                className="gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Transactions
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportBeneficiaries}
                disabled={isExporting !== null}
                className="gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                Beneficiaries
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportMerchants}
                disabled={isExporting !== null}
                className="gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                Merchants
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="gradient-primary text-primary-foreground font-semibold shadow-glow hover:shadow-lg transition-all">
            Create Program
          </Button>
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
      <Card className="glass border-border/50 overflow-hidden">
        <div className="absolute inset-0 gradient-glow opacity-30 pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 glass-hover border-border/50">
              <Users className="w-5 h-5 text-info" />
              <span>Add Beneficiaries</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 glass-hover border-border/50">
              <Store className="w-5 h-5 text-warning" />
              <span>Register Merchant</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 glass-hover border-border/50">
              <IndianRupee className="w-5 h-5 text-success" />
              <span>Disburse Tokens</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 glass-hover border-border/50">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span>View Flagged</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Active Programs</h2>
          <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
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
