import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { WalletState, UserRole } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WalletContextType {
  wallet: WalletState;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  isCreatingProfile: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Polygon Mumbai testnet chain ID
const REQUIRED_CHAIN_ID = 80001;

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
    chainId: null,
    isCorrectNetwork: false,
  });

  const [userRole, setUserRole] = useState<UserRole>('BENEFICIARY');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Create or update profile in database
  const syncWalletToDatabase = useCallback(async (walletAddress: string) => {
    try {
      setIsCreatingProfile(true);
      
      // Check if profile exists with this wallet
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (existingProfile) {
        // Fetch user role from user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', existingProfile.user_id)
          .maybeSingle();

        if (roleData?.role) {
          const roleMap: Record<string, UserRole> = {
            admin: 'ADMIN',
            donor: 'DONOR',
            beneficiary: 'BENEFICIARY',
            merchant: 'MERCHANT',
            field_agent: 'FIELD_AGENT',
          };
          setUserRole(roleMap[roleData.role] || 'BENEFICIARY');
        }
        toast.success('Welcome back!', {
          description: `Connected as ${existingProfile.name || walletAddress.slice(0, 8)}`,
        });
      } else {
        // New wallet - check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Update existing profile with wallet address
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ wallet_address: walletAddress })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          } else {
            toast.success('Wallet linked to account', {
              description: 'Your wallet has been connected to your profile',
            });
          }
        } else {
          toast.info('New wallet detected', {
            description: 'Sign in to create a profile and access all features',
          });
        }
      }
    } catch (error) {
      console.error('Error syncing wallet:', error);
    } finally {
      setIsCreatingProfile(false);
    }
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts.length > 0) {
            const chainId = await (window as any).ethereum.request({ 
              method: 'eth_chainId' 
            });
            const address = accounts[0];
            setWallet({
              connected: true,
              address,
              balance: 25000, // Mock balance in relief tokens
              chainId: parseInt(chainId, 16),
              isCorrectNetwork: parseInt(chainId, 16) === REQUIRED_CHAIN_ID,
            });
            
            // Sync with database
            await syncWalletToDatabase(address);
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };

    checkExistingConnection();
  }, [syncWalletToDatabase]);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => ({
            ...prev,
            address: accounts[0],
          }));
          // Sync new account with database
          await syncWalletToDatabase(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        setWallet(prev => ({
          ...prev,
          chainId: numericChainId,
          isCorrectNetwork: numericChainId === REQUIRED_CHAIN_ID,
        }));
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [syncWalletToDatabase]);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      toast.error('MetaMask not detected', {
        description: 'Please install MetaMask to use this application',
      });
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await (window as any).ethereum.request({
        method: 'eth_chainId',
      });

      const numericChainId = parseInt(chainId, 16);
      const address = accounts[0];

      setWallet({
        connected: true,
        address,
        balance: 25000, // Mock balance
        chainId: numericChainId,
        isCorrectNetwork: numericChainId === REQUIRED_CHAIN_ID,
      });

      toast.success('Wallet connected', {
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      // Sync with database
      await syncWalletToDatabase(address);

      if (numericChainId !== REQUIRED_CHAIN_ID) {
        toast.warning('Wrong network', {
          description: 'Please switch to Polygon Mumbai testnet',
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error('Connection failed', {
        description: error.message || 'Failed to connect wallet',
      });
    }
  }, [syncWalletToDatabase]);

  const disconnectWallet = useCallback(() => {
    setWallet({
      connected: false,
      address: null,
      balance: 0,
      chainId: null,
      isCorrectNetwork: false,
    });
    setUserRole('BENEFICIARY');
    toast.info('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return;
    }

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}`,
              chainName: 'Polygon Mumbai',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
            }],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add network');
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  }, []);

  return (
    <WalletContext.Provider 
      value={{ 
        wallet, 
        userRole, 
        setUserRole, 
        connectWallet, 
        disconnectWallet, 
        switchNetwork,
        isCreatingProfile,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
