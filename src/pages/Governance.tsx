import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StatCard from '@/components/dashboard/StatCard';
import { useWallet } from '@/contexts/WalletContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Vote, 
  Plus, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users,
  TrendingUp,
  Gavel
} from 'lucide-react';
import { formatCurrency, mockPrograms, mockProposals } from '@/lib/mockData';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

const Governance: React.FC = () => {
  const { wallet } = useWallet();
  const [proposals, setProposals] = useState(mockProposals);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposedField, setProposedField] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [proposedValue, setProposedValue] = useState('');

  // Subscribe to real-time proposal updates
  useEffect(() => {
    const channel = supabase
      .channel('proposals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals'
        },
        (payload) => {
          console.log('Proposal update:', payload);
          if (payload.eventType === 'INSERT') {
            toast.info('New proposal created!', {
              description: (payload.new as any).title,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Proposal updated!', {
              description: 'Vote counts have been updated',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Stats calculations
  const totalVotingPower = 7500;
  const activeProposals = proposals.filter(p => p.status === 'ACTIVE').length;
  const passedProposals = proposals.filter(p => p.status === 'PASSED').length;

  const handleCreateProposal = () => {
    if (!proposalTitle || !proposalDescription || !selectedProgram || !proposedField || !proposedValue) {
      toast.error('Please fill in all fields');
      return;
    }

    const newProposal = {
      id: `prop-${Date.now()}`,
      programId: selectedProgram,
      title: proposalTitle,
      description: proposalDescription,
      proposerAddress: wallet.address || '0x...',
      proposedChange: {
        field: proposedField,
        currentValue: parseFloat(currentValue) || 0,
        proposedValue: parseFloat(proposedValue),
      },
      votesFor: 0,
      votesAgainst: 0,
      status: 'ACTIVE' as const,
      createdAt: new Date(),
      votingEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    setProposals([newProposal, ...proposals]);
    setShowCreateDialog(false);
    resetForm();
    toast.success('Proposal created successfully!');
  };

  const resetForm = () => {
    setProposalTitle('');
    setProposalDescription('');
    setSelectedProgram('');
    setProposedField('');
    setCurrentValue('');
    setProposedValue('');
  };

  const handleVote = (proposalId: string, voteFor: boolean) => {
    setProposals(proposals.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votesFor: voteFor ? p.votesFor + 100 : p.votesFor,
          votesAgainst: !voteFor ? p.votesAgainst + 100 : p.votesAgainst,
        };
      }
      return p;
    }));
    toast.success(`Vote recorded: ${voteFor ? 'For' : 'Against'}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="info" className="gap-1"><Clock className="w-3 h-3" />Active</Badge>;
      case 'PASSED':
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" />Passed</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      case 'EXECUTED':
        return <Badge variant="default" className="gap-1"><Gavel className="w-3 h-3" />Executed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Chart data for voting results
  const getVotingChartData = (proposal: typeof proposals[0]) => {
    const total = proposal.votesFor + proposal.votesAgainst;
    const abstain = Math.max(0, totalVotingPower - total);
    return [
      { name: 'For', value: proposal.votesFor, color: 'hsl(142, 71%, 45%)' },
      { name: 'Against', value: proposal.votesAgainst, color: 'hsl(0, 72%, 51%)' },
      { name: 'Abstain', value: abstain, color: 'hsl(215, 16%, 47%)' },
    ];
  };

  // Aggregate voting data for bar chart
  const aggregateVotingData = proposals.map(p => ({
    name: p.title.substring(0, 20) + '...',
    for: p.votesFor,
    against: p.votesAgainst,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">DAO Governance</h1>
              <p className="text-muted-foreground mt-1">
                Create proposals and vote on program changes
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Proposal</DialogTitle>
                  <DialogDescription>
                    Propose changes to program parameters. Requires donor voting power.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPrograms.filter(p => p.status === 'ACTIVE').map(program => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Proposal Title</Label>
                    <Input 
                      placeholder="e.g., Increase daily limit"
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Explain why this change is needed..."
                      value={proposalDescription}
                      onChange={(e) => setProposalDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field to Change</Label>
                    <Select value={proposedField} onValueChange={setProposedField}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perHouseholdAllocation">Per Household Allocation</SelectItem>
                        <SelectItem value="dailyLimit">Daily Spending Limit</SelectItem>
                        <SelectItem value="totalBudget">Total Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Value (₹)</Label>
                      <Input 
                        type="number"
                        placeholder="Current value"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proposed Value (₹)</Label>
                      <Input 
                        type="number"
                        placeholder="New value"
                        value={proposedValue}
                        onChange={(e) => setProposedValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={handleCreateProposal}>
                    Create Proposal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Your Voting Power"
              value={formatCurrency(100).replace('₹', '')}
              subtitle="Based on donations"
              icon={Vote}
              variant="primary"
            />
            <StatCard
              title="Active Proposals"
              value={activeProposals.toString()}
              subtitle="Awaiting votes"
              icon={Clock}
              variant="info"
            />
            <StatCard
              title="Passed Proposals"
              value={passedProposals.toString()}
              subtitle="Successfully approved"
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              title="Total Voters"
              value="156"
              subtitle="Active DAO members"
              icon={Users}
              variant="warning"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Proposals</TabsTrigger>
              <TabsTrigger value="all">All Proposals</TabsTrigger>
              <TabsTrigger value="analytics">Voting Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {proposals.filter(p => p.status === 'ACTIVE').map(proposal => {
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                const chartData = getVotingChartData(proposal);

                return (
                  <Card key={proposal.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(proposal.status)}
                            <span className="text-sm text-muted-foreground">
                              Ends {new Date(proposal.votingEndsAt).toLocaleDateString()}
                            </span>
                          </div>
                          <CardTitle className="text-xl">{proposal.title}</CardTitle>
                          <CardDescription>{proposal.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Voting Progress */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-success font-medium">For: {formatCurrency(proposal.votesFor)}</span>
                              <span className="text-destructive font-medium">Against: {formatCurrency(proposal.votesAgainst)}</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                              <div 
                                className="bg-success transition-all duration-500"
                                style={{ width: `${forPercentage}%` }}
                              />
                              <div 
                                className="bg-destructive transition-all duration-500"
                                style={{ width: `${100 - forPercentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground mb-2">Proposed Change</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{proposal.proposedChange.field}</Badge>
                              <span>{formatCurrency(proposal.proposedChange.currentValue)}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-bold text-primary">{formatCurrency(proposal.proposedChange.proposedValue)}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 gap-2 border-success text-success hover:bg-success hover:text-success-foreground"
                              onClick={() => handleVote(proposal.id, true)}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Vote For
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleVote(proposal.id, false)}
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Vote Against
                            </Button>
                          </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => formatCurrency(value as number)}
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--card))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {proposals.filter(p => p.status === 'ACTIVE').length === 0 && (
                <Card className="py-12 text-center">
                  <CardContent>
                    <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to create a proposal for program improvements
                    </p>
                    <Button variant="hero" onClick={() => setShowCreateDialog(true)}>
                      Create Proposal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {proposals.map(proposal => {
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;

                return (
                  <Card key={proposal.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(proposal.status)}
                            <span className="text-sm text-muted-foreground">
                              {new Date(proposal.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground">{proposal.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {forPercentage.toFixed(1)}% approval
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(proposal.votesFor + proposal.votesAgainst)} total votes
                          </div>
                        </div>
                      </div>
                      <Progress value={forPercentage} className="mt-4 h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Voting Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Voting Distribution
                    </CardTitle>
                    <CardDescription>
                      For vs Against votes per proposal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregateVotingData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          />
                          <YAxis 
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                          />
                          <Tooltip 
                            formatter={(value) => formatCurrency(value as number)}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="for" name="For" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="against" name="Against" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Proposal Outcomes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Proposal Outcomes
                    </CardTitle>
                    <CardDescription>
                      Overall success rate of proposals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Passed', value: passedProposals, color: 'hsl(142, 71%, 45%)' },
                              { name: 'Active', value: activeProposals, color: 'hsl(217, 91%, 60%)' },
                              { name: 'Rejected', value: proposals.filter(p => p.status === 'REJECTED').length, color: 'hsl(0, 72%, 51%)' },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {[
                              { color: 'hsl(142, 71%, 45%)' },
                              { color: 'hsl(217, 91%, 60%)' },
                              { color: 'hsl(0, 72%, 51%)' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Voting Activity</CardTitle>
                  <CardDescription>Latest votes and proposal updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { voter: '0x4B08...D2dB', action: 'voted For', proposal: 'Increase allocation', time: '2 hours ago', power: 500 },
                      { voter: '0x5830...0225', action: 'voted Against', proposal: 'Extend program', time: '4 hours ago', power: 250 },
                      { voter: '0x71C7...976F', action: 'created', proposal: 'Add fuel category', time: '6 hours ago', power: 0 },
                      { voter: '0x8ba1...BA72', action: 'voted For', proposal: 'Increase allocation', time: '8 hours ago', power: 100 },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.action.includes('For') ? 'bg-success/20' : 
                            activity.action.includes('Against') ? 'bg-destructive/20' : 'bg-primary/20'
                          }`}>
                            {activity.action.includes('For') ? (
                              <ThumbsUp className="w-4 h-4 text-success" />
                            ) : activity.action.includes('Against') ? (
                              <ThumbsDown className="w-4 h-4 text-destructive" />
                            ) : (
                              <Plus className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              <span className="font-mono text-sm">{activity.voter}</span>
                              <span className="text-muted-foreground"> {activity.action} </span>
                              "{activity.proposal}"
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        {activity.power > 0 && (
                          <Badge variant="outline">{formatCurrency(activity.power)} power</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Governance;
