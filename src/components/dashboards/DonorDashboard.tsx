import React from 'react';
import { 
  Heart, 
  TrendingUp, 
  Users,
  Vote,
  ArrowUpRight,
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import ProgramCard from '@/components/dashboard/ProgramCard';
import { useWallet } from '@/contexts/WalletContext';
import { 
  mockPrograms, 
  mockDonors,
  mockProposals,
  mockAnalytics,
  formatCurrency,
  formatDate
} from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DonorDashboard: React.FC = () => {
  const { wallet } = useWallet();
  const [donationAmount, setDonationAmount] = React.useState('');
  const [selectedProgram, setSelectedProgram] = React.useState('');
  
  // Mock donor data
  const donor = mockDonors[0];
  const activePrograms = mockPrograms.filter(p => p.status === 'ACTIVE');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Donor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your donations and participate in program governance
          </p>
        </div>
        <Badge variant="donor" className="w-fit">
          <Heart className="w-3 h-3 mr-1" />
          Verified Donor
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 stagger-children">
        <StatCard
          title="Total Donated"
          value={formatCurrency(donor.totalDonated)}
          subtitle={`Across ${donor.programs.length} programs`}
          icon={Heart}
          variant="success"
          trend={{ value: 25, isPositive: true }}
        />
        <StatCard
          title="Voting Power"
          value={donor.votingPower.toLocaleString()}
          subtitle="DAO tokens"
          icon={Vote}
          variant="primary"
        />
        <StatCard
          title="Impact"
          value="1,450"
          subtitle="Families helped"
          icon={Users}
          variant="info"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="donate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="donate">Donate</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="dao">DAO Proposals</TabsTrigger>
        </TabsList>

        {/* Donate Tab */}
        <TabsContent value="donate" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Donation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Make a Donation</CardTitle>
                <CardDescription>
                  Support disaster relief programs with transparent fund tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Program</Label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a program to support" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          <div className="flex items-center gap-2">
                            <span>{program.name}</span>
                            <Badge variant="secondary">{program.state}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Donation Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="text-xl h-12"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 25000, 50000, 100000].map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => setDonationAmount(value.toString())}
                    >
                      ₹{(value / 1000)}K
                    </Button>
                  ))}
                </div>

                {donationAmount && (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground">Your donation will help</p>
                    <p className="text-2xl font-bold text-success">
                      {Math.floor(parseFloat(donationAmount) / 25000)} families
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on ₹25,000 allocation per household
                    </p>
                  </div>
                )}

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={!selectedProgram || !donationAmount}
                >
                  <Heart className="w-5 h-5" />
                  Donate {donationAmount ? formatCurrency(parseFloat(donationAmount)) : ''}
                </Button>
              </CardContent>
            </Card>

            {/* Active Programs */}
            <div className="space-y-4">
              <h3 className="font-semibold">Active Programs</h3>
              {activePrograms.slice(0, 2).map((program) => (
                <ProgramCard key={program.id} program={program} showActions={false} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsCharts analytics={mockAnalytics} />
        </TabsContent>

        {/* DAO Tab */}
        <TabsContent value="dao" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Active Proposals</h3>
              <p className="text-muted-foreground">
                Vote on program changes using your DAO tokens
              </p>
            </div>
            <Button variant="outline">Create Proposal</Button>
          </div>

          <div className="space-y-4">
            {mockProposals.map((proposal) => {
              const totalVotes = proposal.votesFor + proposal.votesAgainst;
              const forPercentage = (proposal.votesFor / totalVotes) * 100;

              return (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{proposal.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {proposal.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          proposal.status === 'PASSED' ? 'success' : 
                          proposal.status === 'ACTIVE' ? 'info' : 
                          'secondary'
                        }
                      >
                        {proposal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Voting Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-success">For: {forPercentage.toFixed(0)}%</span>
                        <span className="text-destructive">Against: {(100 - forPercentage).toFixed(0)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-destructive/20 overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all duration-500"
                          style={{ width: `${forPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{proposal.votesFor.toLocaleString()} votes</span>
                        <span>{proposal.votesAgainst.toLocaleString()} votes</span>
                      </div>
                    </div>

                    {/* Proposed Change */}
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Proposed Change</p>
                      <p className="text-sm">
                        {proposal.proposedChange.field}: {formatCurrency(proposal.proposedChange.currentValue)} → 
                        <span className="text-success font-medium ml-1">
                          {formatCurrency(proposal.proposedChange.proposedValue)}
                        </span>
                      </p>
                    </div>

                    {/* Voting Deadline */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Voting ends {formatDate(proposal.votingEndsAt)}</span>
                      </div>
                      
                      {proposal.status === 'ACTIVE' && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Vote Against
                          </Button>
                          <Button variant="success" size="sm">
                            Vote For
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonorDashboard;
