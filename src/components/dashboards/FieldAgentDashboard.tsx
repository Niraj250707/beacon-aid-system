import React, { useState } from 'react';
import { 
  Search, 
  QrCode, 
  User,
  Phone,
  MapPin,
  Shield,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useWallet } from '@/contexts/WalletContext';
import { 
  mockBeneficiaries, 
  mockPrograms,
  formatCurrency,
  formatDate,
  formatAddress
} from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { Beneficiary } from '@/types';

const FieldAgentDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleSearch = () => {
    // Mock search - in real app would query backend
    const found = mockBeneficiaries.find(
      b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           b.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSelectedBeneficiary(found || null);
  };

  const todayVerifications = 12;
  const todayRegistrations = 5;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Field Agent Portal</h1>
          <p className="text-muted-foreground mt-1">
            Verify beneficiaries and generate QR vouchers for distribution
          </p>
        </div>
        <Badge variant="agent" className="w-fit">
          <Shield className="w-3 h-3 mr-1" />
          Field Agent
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 stagger-children">
        <StatCard
          title="Today's Verifications"
          value={todayVerifications}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="New Registrations"
          value={todayRegistrations}
          icon={User}
          variant="info"
        />
        <StatCard
          title="QR Vouchers Generated"
          value={8}
          icon={QrCode}
          variant="primary"
        />
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Beneficiary Lookup</CardTitle>
          <CardDescription>
            Search by name, phone number, or wallet address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter name, phone, or wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12"
              />
            </div>
            <Button variant="hero" size="lg" onClick={handleSearch}>
              <Search className="w-5 h-5" />
              Search
            </Button>
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Quick search:</span>
            {mockBeneficiaries.slice(0, 3).map((b) => (
              <Button
                key={b.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(b.name);
                  setSelectedBeneficiary(b);
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
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedBeneficiary.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Wallet className="w-3 h-3" />
                    {formatAddress(selectedBeneficiary.walletAddress)}
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant={selectedBeneficiary.status === 'ACTIVE' ? 'active' : 'warning'}
              >
                {selectedBeneficiary.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Household Size</p>
                <p className="text-xl font-semibold">{selectedBeneficiary.householdSize} members</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-xl font-semibold text-success">
                  {formatCurrency(selectedBeneficiary.totalReceived)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(selectedBeneficiary.totalSpent)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-xl font-semibold text-primary">
                  {formatCurrency(selectedBeneficiary.totalReceived - selectedBeneficiary.totalSpent)}
                </p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
              <div className="p-6 bg-white rounded-2xl">
                <QRCodeSVG 
                  value={selectedBeneficiary.walletAddress}
                  size={180}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Wallet Address</h4>
                  <code className="block p-3 rounded-lg bg-muted text-sm font-mono break-all">
                    {selectedBeneficiary.walletAddress}
                  </code>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print QR Voucher
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Send SMS
                  </Button>
                  <Button variant="success" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Verify Identity
                  </Button>
                </div>
              </div>
            </div>

            {/* Program Info */}
            {(() => {
              const program = mockPrograms.find(p => p.id === selectedBeneficiary.programId);
              if (!program) return null;
              
              return (
                <div className="p-4 rounded-xl border border-border">
                  <h4 className="font-semibold mb-3">Enrolled Program</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Program Name</p>
                      <p className="font-medium">{program.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{program.district}, {program.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrollment Date</p>
                      <p className="font-medium">{formatDate(selectedBeneficiary.enrolledAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && !selectedBeneficiary && (
        <Card className="animate-fade-in">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No Beneficiary Found</h3>
            <p className="text-muted-foreground mt-1">
              No results found for "{searchQuery}". Try a different search term.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <User className="w-5 h-5" />
              <span>Register New Beneficiary</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <QrCode className="w-5 h-5" />
              <span>Bulk QR Generation</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <MapPin className="w-5 h-5" />
              <span>Update Location</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Printer className="w-5 h-5" />
              <span>Print Vouchers</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldAgentDashboard;
