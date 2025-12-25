import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime, formatAddress } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  userAddress?: string;
  showProgram?: boolean;
  className?: string;
}

const typeConfig = {
  AIRDROP: { label: 'Airdrop', color: 'success', icon: ArrowDownLeft },
  PAYMENT: { label: 'Payment', color: 'info', icon: ArrowUpRight },
  CASHOUT: { label: 'Cash Out', color: 'warning', icon: ArrowUpRight },
  CLAWBACK: { label: 'Clawback', color: 'destructive', icon: ArrowUpRight },
  DONATION: { label: 'Donation', color: 'donor', icon: ArrowDownLeft },
};

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  userAddress,
  showProgram = false,
  className,
}) => {
  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden sm:table-cell">From / To</TableHead>
                {showProgram && <TableHead className="hidden md:table-cell">Category</TableHead>}
                <TableHead className="hidden md:table-cell">Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const config = typeConfig[tx.type];
                const Icon = config.icon;
                const isIncoming = tx.toAddress.toLowerCase() === userAddress?.toLowerCase();
                
                return (
                  <TableRow key={tx.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'p-1.5 rounded-lg',
                          `bg-${config.color}/10`
                        )}>
                          <Icon className={cn('w-4 h-4', `text-${config.color}`)} />
                        </div>
                        <span className="font-medium">{config.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'font-semibold',
                        isIncoming ? 'text-success' : 'text-foreground'
                      )}>
                        {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {isIncoming ? 'From' : 'To'}
                        </span>
                        <span className="font-mono text-sm">
                          {formatAddress(isIncoming ? tx.fromAddress : tx.toAddress)}
                        </span>
                      </div>
                    </TableCell>
                    {showProgram && (
                      <TableCell className="hidden md:table-cell">
                        {tx.category && (
                          <Badge variant="secondary">{tx.category}</Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDateTime(tx.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={tx.status === 'CONFIRMED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'destructive'}
                        >
                          {tx.status}
                        </Badge>
                        <a 
                          href={`https://mumbai.polygonscan.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
