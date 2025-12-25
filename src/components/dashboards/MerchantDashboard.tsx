import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  AlertTriangle,
  ArrowDownLeft,
  Banknote,
  Shield,
  Clock
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import TransactionList from '@/components/dashboard/TransactionList';
import { useWallet } from '@/contexts/WalletContext';
import { 
  mockMerchants, 
  mockTransactions,
  formatCurrency,
  formatDateTime
} from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';

const MerchantDashboard: React.FC = () => {
  const { wallet } = useWallet();
  const [cashoutAmount, setCashoutAmount] = React.useState('');
  const [showCashoutDialog, setShowCashoutDialog] = React.useState(false);
  
  // Mock merchant data
  const merchant = mockMerchants[0];
  const incomingTransactions = mockTransactions.filter(
    tx => tx.toAddress === merchant.walletAddress && tx.type === 'PAYMENT'
  );

  const pendingCashout = merchant.totalReceived - merchant.totalCashedOut;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{merchant.businessName}</h1>
          <p className="text-muted-foreground mt-1">
            Merchant Portal - Accept relief payments and request cashouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={merchant.category === 'Food' ? 'success' : 'info'}>
            {merchant.category}
          </Badge>
          <Badge variant="active">Verified Merchant</Badge>
        </div>
      </div>

      {/* Risk Alert */}
      {merchant.riskLevel !== 'LOW' && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-warning">Risk Flag Active</p>
              <p className="text-sm text-muted-foreground">{merchant.riskReason}</p>
            </div>
            <Button variant="warning" size="sm">Contact Support</Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 stagger-children">
        <StatCard
          title="Available for Cashout"
          value={formatCurrency(pendingCashout)}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Total Received"
          value={formatCurrency(merchant.totalReceived)}
          subtitle="All time"
          icon={ArrowDownLeft}
          variant="success"
          trend={{ value: 23, isPositive: true }}
        />
        <StatCard
          title="Total Cashed Out"
          value={formatCurrency(merchant.totalCashedOut)}
          icon={Banknote}
          variant="info"
        />
      </div>

      {/* QR Code and Cashout Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Merchant QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Payment QR Code</CardTitle>
            <CardDescription>
              Show this to beneficiaries to receive payments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="p-6 bg-white rounded-2xl">
              <QRCodeSVG 
                value={merchant.walletAddress}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-center">
              <p className="font-mono text-sm text-muted-foreground">
                {merchant.walletAddress}
              </p>
              <Button variant="ghost" size="sm" className="mt-2">
                Copy Address
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cashout Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Cash Out</CardTitle>
            <CardDescription>
              Convert your relief tokens to fiat currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-info/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-gradient mt-1">
                {formatCurrency(pendingCashout)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  24-48 hours
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transaction Fee</span>
                <span>0.5%</span>
              </div>
            </div>

            <Dialog open={showCashoutDialog} onOpenChange={setShowCashoutDialog}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg" className="w-full">
                  <Banknote className="w-5 h-5" />
                  Request Cash Out
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cash Out Request</DialogTitle>
                  <DialogDescription>
                    Enter the amount you wish to cash out. The funds will be transferred to your registered bank account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cashout-amount">Amount (₹)</Label>
                    <Input
                      id="cashout-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(e.target.value)}
                      max={pendingCashout}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Maximum</span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => setCashoutAmount(pendingCashout.toString())}
                    >
                      {formatCurrency(pendingCashout)}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCashoutDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" disabled={!cashoutAmount || parseFloat(cashoutAmount) > pendingCashout}>
                    Confirm Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <TransactionList 
        transactions={incomingTransactions} 
        userAddress={merchant.walletAddress}
      />
    </div>
  );
};

export default MerchantDashboard;
