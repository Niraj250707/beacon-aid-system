import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import StatCard from '@/components/dashboard/StatCard';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Heart, 
  IndianRupee, 
  Vote,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/mockData';
import { mockPrograms, mockProposals, mockAnalytics } from '@/lib/mockData';
import { toast } from 'sonner';

const Donate: React.FC = () => {
  const { wallet } = useWallet();
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const donorData = {
    totalDonated: 5000000,
    votingPower: 5000,
    programsSupported: 2,
  };

  const activePrograms = mockPrograms.filter(p => p.status === 'ACTIVE');

  const handleDonate = async () => {
    if (!selectedProgram || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select a program and enter amount');
      return;
    }

    setIsSubmitting(true);
    // Simulate donation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    toast.success('Donation successful!', {
      description: `You donated ${formatCurrency(parseFloat(amount))} and received voting power.`
    });
    
    setAmount('');
  };

  const quickAmounts = [10000, 50000, 100000, 500000];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Donate</h1>
            <p className="text-muted-foreground mt-1">
              Fund disaster relief programs and gain governance rights
            </p>
          </div>

          {/* Donor Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Donated"
              value={formatCurrency(donorData.totalDonated)}
              subtitle="Lifetime contributions"
              icon={Heart}
              variant="success"
            />
            <StatCard
              title="Voting Power"
              value={donorData.votingPower.toLocaleString()}
              subtitle="DAO governance tokens"
              icon={Vote}
              variant="primary"
            />
            <StatCard
              title="Programs Supported"
              value={donorData.programsSupported}
              subtitle="Active relief programs"
              icon={TrendingUp}
              variant="info"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Donation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-destructive" />
                  Make a Donation
                </CardTitle>
                <CardDescription>
                  Your donation helps families affected by disasters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Program</Label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a program to fund" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{program.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {program.disasterType}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProgram && (
                  <div className="p-4 bg-muted rounded-lg">
                    {(() => {
                      const program = activePrograms.find(p => p.id === selectedProgram);
                      if (!program) return null;
                      const progress = (program.distributedAmount / program.totalBudget) * 100;
                      return (
                        <>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Budget Progress</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{formatCurrency(program.distributedAmount)} raised</span>
                            <span>{formatCurrency(program.totalBudget)} goal</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map((qa) => (
                      <Button
                        key={qa}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(qa.toString())}
                      >
                        {formatCurrency(qa)}
                      </Button>
                    ))}
                  </div>
                </div>

                {amount && parseFloat(amount) > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium mb-1">You will receive:</p>
                    <p className="text-2xl font-bold text-primary">
                      {parseFloat(amount).toLocaleString()} Voting Power
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 ₹ = 1 Voting Power in DAO governance
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleDonate}
                  disabled={!selectedProgram || !amount || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Donate {amount ? formatCurrency(parseFloat(amount)) : ''}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Active Proposals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="w-5 h-5" />
                  DAO Proposals
                </CardTitle>
                <CardDescription>
                  Vote on program changes with your voting power
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockProposals.map((proposal) => {
                  const totalVotes = proposal.votesFor + proposal.votesAgainst;
                  const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                  
                  return (
                    <div key={proposal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{proposal.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {proposal.description.slice(0, 80)}...
                          </p>
                        </div>
                        <Badge 
                          variant={
                            proposal.status === 'ACTIVE' ? 'default' :
                            proposal.status === 'PASSED' ? 'success' : 'secondary'
                          }
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-success">For: {proposal.votesFor.toLocaleString()}</span>
                          <span className="text-destructive">Against: {proposal.votesAgainst.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success transition-all"
                            style={{ width: `${forPercent}%` }}
                          />
                        </div>
                      </div>
                      
                      {proposal.status === 'ACTIVE' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-success" />
                            Vote For
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Vote Against
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {proposal.status === 'ACTIVE' 
                          ? `Voting ends: ${proposal.votingEndsAt.toLocaleDateString()}`
                          : `Ended: ${proposal.votingEndsAt.toLocaleDateString()}`}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Analytics */}
          <AnalyticsCharts analytics={mockAnalytics} />
        </div>
      </main>
    </div>
  );
};

export default Donate;
