import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Store, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Program, ProgramStatus, DisasterType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface ProgramCardProps {
  program: Program;
  onSelect?: () => void;
  showActions?: boolean;
}

const statusVariants: Record<ProgramStatus, 'active' | 'completed' | 'paused' | 'draft' | 'default'> = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CLOSED: 'completed',
};

const disasterIcons: Record<DisasterType, string> = {
  FLOOD: '🌊',
  EARTHQUAKE: '🏚️',
  CYCLONE: '🌀',
  DROUGHT: '☀️',
  PANDEMIC: '🦠',
  FIRE: '🔥',
  OTHER: '⚠️',
};

const ProgramCard: React.FC<ProgramCardProps> = ({ 
  program, 
  onSelect,
  showActions = true 
}) => {
  const progressPercent = (program.distributedAmount / program.totalBudget) * 100;
  const isExpiringSoon = new Date(program.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card 
      variant="stat" 
      className={cn(
        'cursor-pointer group',
        program.status === 'ACTIVE' && 'border-l-4 border-l-success'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{disasterIcons[program.disasterType]}</span>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {program.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{program.district}, {program.state}</span>
              </div>
            </div>
          </div>
          <Badge variant={statusVariants[program.status]}>
            {program.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Utilized</span>
            <span className="font-medium">{progressPercent.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(program.distributedAmount)} distributed</span>
            <span>{formatCurrency(program.totalBudget)} total</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
            </div>
            <p className="text-lg font-semibold">{program.beneficiaryCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Beneficiaries</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Store className="w-3 h-3" />
            </div>
            <p className="text-lg font-semibold">{program.merchantCount}</p>
            <p className="text-xs text-muted-foreground">Merchants</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
            </div>
            <p className="text-lg font-semibold">{formatCurrency(program.perHouseholdAllocation)}</p>
            <p className="text-xs text-muted-foreground">Per Household</p>
          </div>
        </div>

        {/* Expiry Warning */}
        {isExpiringSoon && program.status === 'ACTIVE' && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 text-warning text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Expires {formatDate(program.endDate)}</span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <Button 
            variant="ghost" 
            className="w-full justify-between group-hover:bg-accent"
            onClick={onSelect}
          >
            <span>View Details</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgramCard;
