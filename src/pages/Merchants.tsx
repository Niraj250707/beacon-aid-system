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
  Store, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Loader2,
  Filter,
  Download,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, formatAddress } from '@/lib/mockData';

type MerchantStatus = 'pending' | 'verified' | 'active' | 'suspended' | 'flagged';
type MerchantCategory = 'food' | 'health' | 'shelter' | 'fuel' | 'other';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface Merchant {
  id: string;
  business_name: string;
  wallet_address: string;
  category: MerchantCategory;
  total_received: number;
  total_cashed_out: number;
  risk_score: number;
  risk_level: RiskLevel;
  risk_reason: string | null;
  status: MerchantStatus;
  program_id: string;
  registered_at: string;
  programs?: { name: string };
}

const statusConfig: Record<MerchantStatus, { label: string; variant: string }> = {
  pending: { label: 'Pending', variant: 'warning' },
  verified: { label: 'Verified', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  flagged: { label: 'Flagged', variant: 'destructive' },
};

const categoryConfig: Record<MerchantCategory, { label: string; color: string }> = {
  food: { label: 'Food', color: 'bg-green-500/10 text-green-500' },
  health: { label: 'Health', color: 'bg-blue-500/10 text-blue-500' },
  shelter: { label: 'Shelter', color: 'bg-orange-500/10 text-orange-500' },
  fuel: { label: 'Fuel', color: 'bg-yellow-500/10 text-yellow-500' },
  other: { label: 'Other', color: 'bg-gray-500/10 text-gray-500' },
};

const riskConfig: Record<RiskLevel, { label: string; variant: string }> = {
  low: { label: 'Low', variant: 'success' },
  medium: { label: 'Medium', variant: 'warning' },
  high: { label: 'High', variant: 'destructive' },
  critical: { label: 'Critical', variant: 'destructive' },
};

const Merchants: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select(`
          *,
          programs (name)
        `)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      setMerchants(data || []);
    } catch (error: any) {
      console.error('Error fetching merchants:', error);
      toast.error('Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: MerchantStatus) => {
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Status updated to ${statusConfig[newStatus].label}`);
      fetchMerchants();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredMerchants = merchants.filter(m => {
    const matchesSearch = m.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.wallet_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: merchants.length,
    active: merchants.filter(m => m.status === 'active').length,
    flagged: merchants.filter(m => m.status === 'flagged' || m.risk_level === 'high' || m.risk_level === 'critical').length,
    totalVolume: merchants.reduce((sum, m) => sum + Number(m.total_received), 0),
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
              <h1 className="text-3xl font-bold">Merchants</h1>
              <p className="text-muted-foreground mt-1">
                Manage approved vendors and monitor risk levels
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
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Merchants</p>
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
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Flag className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.flagged}</p>
                    <p className="text-sm text-muted-foreground">Flagged/High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Store className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</p>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
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
                    placeholder="Search by business name or wallet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="shelter">Shelter</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Merchants</CardTitle>
              <CardDescription>
                {filteredMerchants.length} merchants found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMerchants.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No merchants found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Upload merchants via Programs page'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMerchants.map((merchant) => (
                        <TableRow key={merchant.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{merchant.business_name}</p>
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                {formatAddress(merchant.wallet_address)}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={categoryConfig[merchant.category].color}>
                              {categoryConfig[merchant.category].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {merchant.programs?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{formatCurrency(Number(merchant.total_received))}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(Number(merchant.total_cashed_out))} cashed out
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={riskConfig[merchant.risk_level].variant as any}>
                                {riskConfig[merchant.risk_level].label}
                              </Badge>
                              {merchant.risk_reason && (
                                <AlertTriangle className="w-4 h-4 text-warning" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[merchant.status].variant as any}>
                              {statusConfig[merchant.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {merchant.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(merchant.id, 'active')}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-success" />
                                </Button>
                              )}
                              {merchant.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(merchant.id, 'flagged')}
                                >
                                  <Flag className="w-4 h-4 text-warning" />
                                </Button>
                              )}
                              {(merchant.status === 'flagged' || merchant.status === 'suspended') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(merchant.id, 'active')}
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

export default Merchants;
