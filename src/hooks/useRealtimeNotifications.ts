import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/mockData';

interface UseRealtimeNotificationsOptions {
  userAddress?: string;
  onNewTransaction?: (transaction: any) => void;
}

export const useRealtimeNotifications = ({ 
  userAddress, 
  onNewTransaction 
}: UseRealtimeNotificationsOptions = {}) => {
  useEffect(() => {
    // Subscribe to transaction changes
    const transactionsChannel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          const tx = payload.new as any;
          console.log('New transaction:', tx);
          
          // Check if this transaction is relevant to the user
          const isIncoming = tx.to_address?.toLowerCase() === userAddress?.toLowerCase();
          const isOutgoing = tx.from_address?.toLowerCase() === userAddress?.toLowerCase();
          
          if (isIncoming) {
            toast.success('Payment Received! 💰', {
              description: `${formatCurrency(tx.amount)} received`,
              duration: 5000,
            });
          } else if (isOutgoing) {
            toast.info('Payment Sent', {
              description: `${formatCurrency(tx.amount)} sent successfully`,
              duration: 5000,
            });
          }
          
          onNewTransaction?.(tx);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          const tx = payload.new as any;
          const oldTx = payload.old as any;
          
          // Notify on status changes
          if (oldTx.status !== tx.status) {
            if (tx.status === 'confirmed') {
              toast.success('Transaction Confirmed ✓', {
                description: `Transaction ${tx.tx_hash?.slice(0, 10)}... confirmed on blockchain`,
              });
            } else if (tx.status === 'failed') {
              toast.error('Transaction Failed', {
                description: 'The transaction could not be processed',
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to beneficiary balance updates
    const beneficiariesChannel = supabase
      .channel('beneficiaries-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'beneficiaries'
        },
        (payload) => {
          const beneficiary = payload.new as any;
          const oldBeneficiary = payload.old as any;
          
          // Check if balance increased (airdrop received)
          if (beneficiary.total_received > oldBeneficiary.total_received) {
            const difference = beneficiary.total_received - oldBeneficiary.total_received;
            toast.success('Tokens Received! 🎉', {
              description: `${formatCurrency(difference)} relief tokens added to your wallet`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to proposal updates for DAO
    const proposalsChannel = supabase
      .channel('proposals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.info('New Proposal Created 📋', {
              description: (payload.new as any).title,
            });
          } else if (payload.eventType === 'UPDATE') {
            const proposal = payload.new as any;
            const oldProposal = payload.old as any;
            
            // Check for status changes
            if (oldProposal.status !== proposal.status) {
              if (proposal.status === 'passed') {
                toast.success('Proposal Passed! ✓', {
                  description: proposal.title,
                });
              } else if (proposal.status === 'rejected') {
                toast.error('Proposal Rejected', {
                  description: proposal.title,
                });
              } else if (proposal.status === 'executed') {
                toast.success('Proposal Executed! 🚀', {
                  description: proposal.title,
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(beneficiariesChannel);
      supabase.removeChannel(proposalsChannel);
    };
  }, [userAddress, onNewTransaction]);
};

export default useRealtimeNotifications;
