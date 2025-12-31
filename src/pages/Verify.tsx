import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserCheck, 
  QrCode,
  Printer,
  Phone,
  MapPin,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { mockBeneficiaries } from '@/lib/mockData';
import { formatCurrency, formatAddress } from '@/lib/mockData';
import { toast } from 'sonner';

const Verify: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<typeof mockBeneficiaries[0] | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleSearch = () => {
    const found = mockBeneficiaries.find(b => 
      b.id.includes(searchTerm) || 
      b.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (found) {
      setSelectedBeneficiary(found);
      toast.success('Beneficiary found');
    } else {
      toast.error('Beneficiary not found');
      setSelectedBeneficiary(null);
    }
  };

  const handlePrintVoucher = () => {
    if (!selectedBeneficiary) return;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print voucher');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relief Voucher - ${selectedBeneficiary.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              text-align: center;
              background: #fff;
            }
            .voucher { 
              border: 3px solid #000; 
              padding: 30px; 
              max-width: 400px; 
              margin: 0 auto;
              border-radius: 12px;
            }
            .header { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subheader { font-size: 14px; color: #666; margin-bottom: 20px; }
            .qr-container { margin: 20px 0; }
            .info { text-align: left; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { color: #666; }
            .value { font-weight: bold; }
            .footer { font-size: 12px; color: #666; margin-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="voucher">
            <div class="header">🛡️ ReliefChain Voucher</div>
            <div class="subheader">Disaster Relief Payment Card</div>
            
            <div class="qr-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedBeneficiary.walletAddress)}" alt="QR Code" />
            </div>
            
            <div class="info">
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${selectedBeneficiary.name}</span>
              </div>
              <div class="info-row">
                <span class="label">ID:</span>
                <span class="value">${selectedBeneficiary.id}</span>
              </div>
              <div class="info-row">
                <span class="label">Wallet:</span>
                <span class="value">${selectedBeneficiary.walletAddress.slice(0, 10)}...${selectedBeneficiary.walletAddress.slice(-8)}</span>
              </div>
              <div class="info-row">
                <span class="label">Balance:</span>
                <span class="value">₹${(selectedBeneficiary.totalReceived - selectedBeneficiary.totalSpent).toLocaleString()}</span>
              </div>
            </div>
            
            <div class="footer">
              Present this voucher at any approved merchant.<br/>
              Merchant will scan QR code to process payment.
            </div>
          </div>
          
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
            Print Voucher
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Field Verification</h1>
            <p className="text-muted-foreground mt-1">
              Search beneficiaries and generate QR vouchers
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Beneficiary
              </CardTitle>
              <CardDescription>
                Search by ID, wallet address, name, or phone number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter beneficiary ID, wallet, name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="mt-4 flex gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground w-full mb-2">Quick search:</p>
                {mockBeneficiaries.map((b) => (
                  <Button
                    key={b.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBeneficiary(b);
                      setSearchTerm(b.id);
                    }}
                  >
                    {b.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Beneficiary Details */}
          {selectedBeneficiary && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Beneficiary Details
                    </CardTitle>
                    <Badge variant={selectedBeneficiary.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {selectedBeneficiary.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <UserCheck className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold">{selectedBeneficiary.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Wallet className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Wallet Address</p>
                        <code className="text-sm">{formatAddress(selectedBeneficiary.walletAddress)}</code>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Household Size</p>
                        <p className="font-semibold">{selectedBeneficiary.householdSize} members</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(selectedBeneficiary.totalReceived)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Received</p>
                    </div>
                    <div className="text-center p-4 bg-info/10 rounded-lg">
                      <p className="text-2xl font-bold text-info">
                        {formatCurrency(selectedBeneficiary.totalReceived - selectedBeneficiary.totalSpent)}
                      </p>
                      <p className="text-sm text-muted-foreground">Balance</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowQR(!showQR)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {showQR ? 'Hide QR' : 'Show QR'}
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handlePrintVoucher}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Voucher
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              {showQR && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Payment QR Code
                    </CardTitle>
                    <CardDescription>
                      Merchants scan this to receive payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="p-6 bg-white rounded-xl">
                      <QRCodeSVG
                        value={selectedBeneficiary.walletAddress}
                        size={250}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-medium">{selectedBeneficiary.name}</p>
                      <code className="text-sm text-muted-foreground">
                        {selectedBeneficiary.walletAddress}
                      </code>
                    </div>
                    <Button variant="outline" className="mt-4" onClick={handlePrintVoucher}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Voucher
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Instructions */}
          {!selectedBeneficiary && (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search for a Beneficiary</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter the beneficiary's ID, wallet address, name, or phone number to view their details 
                  and generate a printable QR voucher for those without smartphones.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Verify;
