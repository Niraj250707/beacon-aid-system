import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Upload, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle,
  Edit,
  Trash2,
  Users,
  Store,
  IndianRupee,
  Calendar,
  MapPin,
  AlertTriangle,
  FileSpreadsheet,
  Send,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/mockData';

type ProgramStatus = 'draft' | 'active' | 'paused' | 'completed' | 'closed';
type DisasterType = 'flood' | 'earthquake' | 'cyclone' | 'drought' | 'pandemic' | 'fire' | 'other';

interface Program {
  id: string;
  name: string;
  description: string | null;
  disaster_type: DisasterType;
  state: string;
  district: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  distributed_amount: number;
  per_household_allocation: number;
  daily_limit: number;
  status: ProgramStatus;
  beneficiary_count: number;
  merchant_count: number;
  created_at: string;
}

const disasterTypes: { value: DisasterType; label: string }[] = [
  { value: 'flood', label: 'Flood' },
  { value: 'earthquake', label: 'Earthquake' },
  { value: 'cyclone', label: 'Cyclone' },
  { value: 'drought', label: 'Drought' },
  { value: 'pandemic', label: 'Pandemic' },
  { value: 'fire', label: 'Fire' },
  { value: 'other', label: 'Other' },
];

const statusConfig: Record<ProgramStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'secondary' },
  active: { label: 'Active', color: 'success' },
  paused: { label: 'Paused', color: 'warning' },
  completed: { label: 'Completed', color: 'info' },
  closed: { label: 'Closed', color: 'destructive' },
};

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [csvType, setCsvType] = useState<'beneficiary' | 'merchant'>('beneficiary');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    disaster_type: 'flood' as DisasterType,
    state: '',
    district: '',
    start_date: '',
    end_date: '',
    total_budget: '',
    per_household_allocation: '',
    daily_limit: '',
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('programs')
        .insert({
          name: formData.name,
          description: formData.description,
          disaster_type: formData.disaster_type,
          state: formData.state,
          district: formData.district,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_budget: parseFloat(formData.total_budget),
          per_household_allocation: parseFloat(formData.per_household_allocation),
          daily_limit: parseFloat(formData.daily_limit),
          status: 'draft' as ProgramStatus,
        });

      if (error) throw error;

      toast.success('Program created successfully');
      setIsCreateOpen(false);
      setFormData({
        name: '',
        description: '',
        disaster_type: 'flood',
        state: '',
        district: '',
        start_date: '',
        end_date: '',
        total_budget: '',
        per_household_allocation: '',
        daily_limit: '',
      });
      fetchPrograms();
    } catch (error: any) {
      console.error('Error creating program:', error);
      toast.error('Failed to create program', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (programId: string, newStatus: ProgramStatus) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update({ status: newStatus })
        .eq('id', programId);

      if (error) throw error;

      toast.success(`Program status updated to ${statusConfig[newStatus].label}`);
      fetchPrograms();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile || !selectedProgram) return;
    
    setIsSubmitting(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        records.push(record);
      }

      if (csvType === 'beneficiary') {
        // Insert beneficiaries
        const beneficiaries = records.map(r => ({
          program_id: selectedProgram.id,
          name: r.name || 'Unknown',
          wallet_address: r.wallet_address || r.wallet || `0x${Math.random().toString(16).slice(2, 42)}`,
          phone: r.phone || null,
          household_size: parseInt(r.household_size) || 1,
          status: 'pending' as const,
        }));

        const { error } = await supabase
          .from('beneficiaries')
          .insert(beneficiaries);

        if (error) throw error;
        
        // Update beneficiary count
        await supabase
          .from('programs')
          .update({ beneficiary_count: selectedProgram.beneficiary_count + beneficiaries.length })
          .eq('id', selectedProgram.id);

        toast.success(`${beneficiaries.length} beneficiaries uploaded`);
      } else {
        // Insert merchants
        const merchants = records.map(r => ({
          program_id: selectedProgram.id,
          business_name: r.business_name || r.name || 'Unknown Business',
          wallet_address: r.wallet_address || r.wallet || `0x${Math.random().toString(16).slice(2, 42)}`,
          category: (r.category?.toLowerCase() || 'other') as any,
          status: 'pending' as const,
        }));

        const { error } = await supabase
          .from('merchants')
          .insert(merchants);

        if (error) throw error;

        // Update merchant count
        await supabase
          .from('programs')
          .update({ merchant_count: selectedProgram.merchant_count + merchants.length })
          .eq('id', selectedProgram.id);

        toast.success(`${merchants.length} merchants uploaded`);
      }

      setIsCSVOpen(false);
      setCsvFile(null);
      fetchPrograms();
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisburse = async (program: Program) => {
    toast.info('Disbursement triggered', {
      description: `Airdropping ${formatCurrency(program.per_household_allocation)} to ${program.beneficiary_count} beneficiaries`
    });
    // In production, this would call the smart contract
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
              <h1 className="text-3xl font-bold">Programs Management</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage disaster relief programs
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Program</DialogTitle>
                  <DialogDescription>
                    Set up a new disaster relief program
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Program Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Kerala Flood Relief 2024"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Emergency relief for flood-affected families..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Disaster Type</Label>
                      <Select
                        value={formData.disaster_type}
                        onValueChange={(v) => setFormData({ ...formData, disaster_type: v as DisasterType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {disasterTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Kerala"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Wayanad"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="total_budget">Total Budget (₹)</Label>
                      <Input
                        id="total_budget"
                        type="number"
                        value={formData.total_budget}
                        onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                        placeholder="50000000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="per_household_allocation">Per Household (₹)</Label>
                      <Input
                        id="per_household_allocation"
                        type="number"
                        value={formData.per_household_allocation}
                        onChange={(e) => setFormData({ ...formData, per_household_allocation: e.target.value })}
                        placeholder="25000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="daily_limit">Daily Limit (₹)</Label>
                      <Input
                        id="daily_limit"
                        type="number"
                        value={formData.daily_limit}
                        onChange={(e) => setFormData({ ...formData, daily_limit: e.target.value })}
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProgram} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Program
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Programs Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Programs</CardTitle>
              <CardDescription>
                {programs.length} programs total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {programs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first disaster relief program to get started
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Program
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programs.map((program) => {
                        const progress = program.total_budget > 0 
                          ? (Number(program.distributed_amount) / Number(program.total_budget)) * 100 
                          : 0;
                        
                        return (
                          <TableRow key={program.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{program.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {program.beneficiary_count} beneficiaries · {program.merchant_count} merchants
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {program.disaster_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="w-3 h-3" />
                                {program.district}, {program.state}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{formatCurrency(Number(program.total_budget))}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(Number(program.distributed_amount))} distributed
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-24">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {progress.toFixed(1)}%
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConfig[program.status].color as any}>
                                {statusConfig[program.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProgram(program);
                                    setIsCSVOpen(true);
                                  }}
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                                {program.status === 'draft' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange(program.id, 'active')}
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                )}
                                {program.status === 'active' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStatusChange(program.id, 'paused')}
                                    >
                                      <Pause className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleDisburse(program)}
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                {program.status === 'paused' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange(program.id, 'active')}
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CSV Upload Dialog */}
        <Dialog open={isCSVOpen} onOpenChange={setIsCSVOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload</DialogTitle>
              <DialogDescription>
                Upload a CSV file to add beneficiaries or merchants to {selectedProgram?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Tabs value={csvType} onValueChange={(v) => setCsvType(v as 'beneficiary' | 'merchant')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="beneficiary">
                    <Users className="w-4 h-4 mr-2" />
                    Beneficiaries
                  </TabsTrigger>
                  <TabsTrigger value="merchant">
                    <Store className="w-4 h-4 mr-2" />
                    Merchants
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Label htmlFor="csv-file" className="cursor-pointer">
                  <span className="text-primary hover:underline">Choose a file</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                {csvFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Expected CSV format:</p>
                <code className="text-xs text-muted-foreground">
                  {csvType === 'beneficiary' 
                    ? 'name, wallet_address, phone, household_size'
                    : 'business_name, wallet_address, category'}
                </code>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCSVOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCSVUpload} disabled={!csvFile || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Programs;
