import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRPayment from '@/components/payment/QRPayment';
import StatCard from '@/components/dashboard/StatCard';
import TransactionList from '@/components/dashboard/TransactionList';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Wallet, 
  IndianRupee, 
  Store, 
  QrCode,
  Clock,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/mockData';
import { mockTransactions, mockMerchants } from '@/lib/mockData';

const Pay: React.FC = () => {
  const { wallet } = useWallet();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');

  // Mock beneficiary data
  const beneficiaryData = {
    balance: wallet.balance || 25000,
    dailySpent: 2500,
    dailyLimit: 5000,
    totalReceived: 25000,
    totalSpent: 18500,
  };

  const remainingDaily = beneficiaryData.dailyLimit - beneficiaryData.dailySpent;
  const remainingBalance = beneficiaryData.balance;

  const activeMerchants = mockMerchants.filter(m => m.status === 'ACTIVE');

  const handleMerchantSelect = (merchantId: string) => {
    setSelectedMerchant(merchantId);
    setShowPayment(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Pay Merchant</h1>
            <p className="text-muted-foreground mt-1">
              Scan QR or select a merchant to make payment
            </p>
          </div>

          {/* Balance Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Available Balance"
              value={formatCurrency(remainingBalance)}
              subtitle="Relief tokens"
              icon={Wallet}
              variant="primary"
            />
            <StatCard
              title="Today's Limit"
              value={formatCurrency(remainingDaily)}
              subtitle={`${formatCurrency(beneficiaryData.dailySpent)} spent today`}
              icon={Clock}
              variant="info"
            />
            <StatCard
              title="Total Received"
              value={formatCurrency(beneficiaryData.totalReceived)}
              subtitle="From relief program"
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Total Spent"
              value={formatCurrency(beneficiaryData.totalSpent)}
              subtitle="At merchants"
              icon={Store}
              variant="warning"
            />
          </div>

          {/* Payment Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Merchant Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Select Merchant
                </CardTitle>
                <CardDescription>
                  Choose an approved merchant to pay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Merchant</Label>
                  <Select value={selectedMerchant} onValueChange={handleMerchantSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a merchant" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMerchants.map((merchant) => (
                        <SelectItem key={merchant.id} value={merchant.id}>
                          <div className="flex items-center gap-2">
                            <span>{merchant.businessName}</span>
                            <Badge variant="outline" className="text-xs">
                              {merchant.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Or scan a merchant's QR code
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setShowPayment(true)}
                  >
                    <QrCode className="w-4 h-4" />
                    Scan QR Code
                  </Button>
                </div>

                {/* Quick select merchants */}
                <div className="space-y-2">
                  <Label>Recent Merchants</Label>
                  <div className="grid gap-2">
                    {activeMerchants.slice(0, 3).map((merchant) => (
                      <Button
                        key={merchant.id}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => handleMerchantSelect(merchant.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Store className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{merchant.businessName}</p>
                            <p className="text-xs text-muted-foreground">
                              {merchant.category}
                            </p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form / QR Scanner */}
            {showPayment ? (
              <QRPayment 
                onPaymentComplete={() => setShowPayment(false)}
              />
            ) : (
              <Card className="flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Pay</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a merchant or scan QR code to start payment
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>Daily limit remaining: <span className="font-semibold text-foreground">{formatCurrency(remainingDaily)}</span></p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Transactions */}
          <TransactionList 
            transactions={mockTransactions.filter(t => t.type === 'PAYMENT')}
            userAddress={wallet.address || undefined}
          />
        </div>
      </main>
    </div>
  );
};

export default Pay;
