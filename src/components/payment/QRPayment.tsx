import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Store, 
  Scan, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { mockMerchants, formatCurrency } from '@/lib/mockData';
import { Merchant } from '@/types';
import { toast } from 'sonner';

interface QRPaymentProps {
  onPaymentComplete?: () => void;
}

const QRPayment: React.FC<QRPaymentProps> = ({ onPaymentComplete }) => {
  const { wallet } = useWallet();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const activeMerchants = mockMerchants.filter(m => m.status === 'ACTIVE');

  const handleSelectMerchant = (merchantId: string) => {
    const merchant = mockMerchants.find(m => m.id === merchantId);
    setSelectedMerchant(merchant || null);
  };

  const handlePayment = async () => {
    if (!selectedMerchant || !amount) return;

    setIsProcessing(true);
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setPaymentSuccess(true);
    
    toast.success('Payment Successful!', {
      description: `${formatCurrency(parseFloat(amount))} sent to ${selectedMerchant.businessName}`,
    });

    setTimeout(() => {
      setShowConfirmDialog(false);
      setPaymentSuccess(false);
      setAmount('');
      setSelectedMerchant(null);
      onPaymentComplete?.();
    }, 2000);
  };

  const dailyRemaining = 5000 - (wallet.balance > 5000 ? 2500 : 0);
  const canPay = wallet.connected && selectedMerchant && parseFloat(amount) > 0 && parseFloat(amount) <= dailyRemaining;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card variant="glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-gradient">{formatCurrency(wallet.balance)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Daily Limit Remaining</p>
              <p className="text-xl font-semibold">{formatCurrency(dailyRemaining)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merchant Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Select Merchant
          </CardTitle>
          <CardDescription>
            Choose a verified merchant from the list or scan their QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={handleSelectMerchant}>
            <SelectTrigger>
              <SelectValue placeholder="Select a merchant" />
            </SelectTrigger>
            <SelectContent>
              {activeMerchants.map((merchant) => (
                <SelectItem key={merchant.id} value={merchant.id}>
                  <div className="flex items-center gap-2">
                    <span>{merchant.businessName}</span>
                    <Badge variant="secondary" className="ml-2">{merchant.category}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button variant="outline" className="w-full gap-2">
            <Scan className="w-4 h-4" />
            Scan Merchant QR Code
          </Button>
        </CardContent>
      </Card>

      {/* Selected Merchant Details */}
      {selectedMerchant && (
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedMerchant.businessName}</CardTitle>
                <CardDescription className="font-mono text-xs mt-1">
                  {selectedMerchant.walletAddress}
                </CardDescription>
              </div>
              <Badge variant={selectedMerchant.category === 'Food' ? 'success' : 'info'}>
                {selectedMerchant.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center p-4 bg-card rounded-xl border border-border">
              <QRCodeSVG 
                value={selectedMerchant.walletAddress}
                size={150}
                bgColor="transparent"
                fgColor="hsl(210 40% 96%)"
                level="M"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl h-14 text-center font-bold"
              />
              {parseFloat(amount) > dailyRemaining && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Exceeds daily limit
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2000, 5000].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(value.toString())}
                  disabled={value > dailyRemaining}
                >
                  ₹{value}
                </Button>
              ))}
            </div>

            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              disabled={!canPay}
              onClick={() => setShowConfirmDialog(true)}
            >
              Pay {amount ? formatCurrency(parseFloat(amount)) : '₹0'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? 'Payment Successful!' : 'Confirm Payment'}
            </DialogTitle>
            <DialogDescription>
              {paymentSuccess 
                ? 'Your transaction has been confirmed on the blockchain.'
                : 'Please review the payment details before confirming.'
              }
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(parseFloat(amount))}</p>
              <p className="text-muted-foreground">sent to {selectedMerchant?.businessName}</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">{selectedMerchant?.businessName}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-xl">{formatCurrency(parseFloat(amount) || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="secondary">{selectedMerchant?.category}</Badge>
              </div>
            </div>
          )}

          {!paymentSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRPayment;
