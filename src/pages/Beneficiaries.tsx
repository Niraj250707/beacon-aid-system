import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Loader2,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, formatAddress } from '@/lib/mockData';

type BeneficiaryStatus = 'pending' | 'verified' | 'active' | 'suspended';

interface Beneficiary {
  id: string;
  name: string;
  wallet_address: string;
  phone: string | null;
  household_size: number;
  total_received: number;
  total_spent: number;
  status: BeneficiaryStatus;
  program_id: string;
  enrolled_at: string;
  programs?: { name: string };
}

const statusConfig: Record<BeneficiaryStatus, { label: string; variant: string }> = {
  pending: { label: 'Pending', variant: 'warning' },
  verified: { label: 'Verified', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  suspended: { label: 'Suspended', variant: 'destructive' },
};

const Beneficiaries: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select(`
          *,
          programs (name)
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error: any) {
      console.error('Error fetching beneficiaries:', error);
      toast.error('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: BeneficiaryStatus) => {
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Status updated to ${statusConfig[newStatus].label}`);
      fetchBeneficiaries();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: beneficiaries.length,
    active: beneficiaries.filter(b => b.status === 'active').length,
    pending: beneficiaries.filter(b => b.status === 'pending').length,
    totalDistributed: beneficiaries.reduce((sum, b) => sum + Number(b.total_received), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Beneficiaries</h1>
              <p className="text-muted-foreground mt-1">
                Manage aid recipients across all programs
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending Verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Users className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalDistributed)}</p>
                    <p className="text-sm text-muted-foreground">Total Distributed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, wallet, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Beneficiaries</CardTitle>
              <CardDescription>
                {filteredBeneficiaries.length} beneficiaries found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBeneficiaries.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No beneficiaries found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Upload beneficiaries via Programs page'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Household</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBeneficiaries.map((beneficiary) => (
                        <TableRow key={beneficiary.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{beneficiary.name}</p>
                              {beneficiary.phone && (
                                <p className="text-sm text-muted-foreground">{beneficiary.phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {formatAddress(beneficiary.wallet_address)}
                            </code>
                          </TableCell>
                          <TableCell>
                            {beneficiary.programs?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {beneficiary.household_size} members
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(beneficiary.total_received))}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(beneficiary.total_spent))}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[beneficiary.status].variant as any}>
                              {statusConfig[beneficiary.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {beneficiary.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(beneficiary.id, 'active')}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-success" />
                                </Button>
                              )}
                              {beneficiary.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(beneficiary.id, 'suspended')}
                                >
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                              {beneficiary.status === 'suspended' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(beneficiary.id, 'active')}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-success" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Beneficiaries;
