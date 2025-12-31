import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import StatCard from '@/components/dashboard/StatCard';
import TransactionList from '@/components/dashboard/TransactionList';
import { useWallet } from '@/contexts/WalletContext';
import { 
  IndianRupee, 
  ArrowDownLeft, 
  ArrowUpRight,
  Store,
  Wallet,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatAddress } from '@/lib/mockData';
import { mockTransactions } from '@/lib/mockData';
import { toast } from 'sonner';

const Transactions: React.FC = () => {
  const { wallet } = useWallet();

  // Mock merchant data
  const merchantData = {
    businessName: 'Krishna Groceries',
    category: 'Food',
    totalReceived: 450000,
    totalCashedOut: 400000,
    pendingCashout: 50000,
    riskLevel: 'LOW' as const,
    status: 'ACTIVE' as const,
  };

  const balance = merchantData.totalReceived - merchantData.totalCashedOut;

  const handleCashout = () => {
    toast.success('Cash-out requested', {
      description: `${formatCurrency(balance)} will be settled to your bank account within 24 hours.`
    });
  };

  // Filter transactions for this merchant
  const merchantTransactions = mockTransactions.filter(t => t.type === 'PAYMENT');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{merchantData.businessName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{merchantData.category}</Badge>
                <Badge variant={merchantData.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {merchantData.status}
                </Badge>
                <Badge variant={merchantData.riskLevel === 'LOW' ? 'success' : 'warning'}>
                  Risk: {merchantData.riskLevel}
                </Badge>
              </div>
            </div>
            <Button variant="hero" size="lg" onClick={handleCashout}>
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Cash Out {formatCurrency(balance)}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Received"
              value={formatCurrency(merchantData.totalReceived)}
              subtitle="From beneficiaries"
              icon={ArrowDownLeft}
              variant="success"
            />
            <StatCard
              title="Cashed Out"
              value={formatCurrency(merchantData.totalCashedOut)}
              subtitle="Settled to bank"
              icon={ArrowUpRight}
              variant="info"
            />
            <StatCard
              title="Available Balance"
              value={formatCurrency(balance)}
              subtitle="Ready for cash-out"
              icon={Wallet}
              variant="primary"
            />
            <StatCard
              title="Transactions"
              value={merchantTransactions.length.toString()}
              subtitle="Total payments received"
              icon={Store}
              variant="warning"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* QR Code for Receiving Payments */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Receive Payments</CardTitle>
                <CardDescription>
                  Beneficiaries scan this QR to pay you
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="p-6 bg-white rounded-xl">
                  <QRCodeSVG
                    value={wallet.address || '0x2546BcD3c84621e976D8185a91A922aE77ECEc30'}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-medium">{merchantData.businessName}</p>
                  <code className="text-xs text-muted-foreground">
                    {formatAddress(wallet.address || '0x2546BcD3c84621e976D8185a91A922aE77ECEc30')}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Cash-out History */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cash-out History</CardTitle>
                <CardDescription>
                  Recent settlements to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { amount: 100000, date: '2024-12-18', status: 'completed' },
                    { amount: 150000, date: '2024-12-10', status: 'completed' },
                    { amount: 150000, date: '2024-12-01', status: 'completed' },
                  ].map((cashout, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {cashout.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning" />
                        )}
                        <div>
                          <p className="font-medium">{formatCurrency(cashout.amount)}</p>
                          <p className="text-sm text-muted-foreground">{cashout.date}</p>
                        </div>
                      </div>
                      <Badge variant={cashout.status === 'completed' ? 'success' : 'warning'}>
                        {cashout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <TransactionList 
            transactions={merchantTransactions}
            title="Incoming Payments"
          />
        </div>
      </main>
    </div>
  );
};

export default Transactions;
