import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wallet, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Store, 
  Heart, 
  UserCheck,
  Shield,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress, formatCurrency } from '@/lib/mockData';
import { UserRole } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  ADMIN: { label: 'Admin', icon: <Shield className="w-4 h-4" />, color: 'admin' },
  DONOR: { label: 'Donor', icon: <Heart className="w-4 h-4" />, color: 'donor' },
  BENEFICIARY: { label: 'Beneficiary', icon: <Users className="w-4 h-4" />, color: 'beneficiary' },
  MERCHANT: { label: 'Merchant', icon: <Store className="w-4 h-4" />, color: 'merchant' },
  FIELD_AGENT: { label: 'Field Agent', icon: <UserCheck className="w-4 h-4" />, color: 'agent' },
};

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { wallet, userRole, setUserRole, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const roleInfo = roleConfig[userRole];

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    ...(userRole === 'ADMIN' ? [
      { path: '/programs', label: 'Programs', icon: <Shield className="w-4 h-4" /> },
      { path: '/beneficiaries', label: 'Beneficiaries', icon: <Users className="w-4 h-4" /> },
      { path: '/merchants', label: 'Merchants', icon: <Store className="w-4 h-4" /> },
    ] : []),
    ...(userRole === 'BENEFICIARY' ? [
      { path: '/pay', label: 'Pay Merchant', icon: <Store className="w-4 h-4" /> },
    ] : []),
    ...(userRole === 'MERCHANT' ? [
      { path: '/transactions', label: 'Transactions', icon: <Store className="w-4 h-4" /> },
    ] : []),
    ...(userRole === 'DONOR' ? [
      { path: '/donate', label: 'Donate', icon: <Heart className="w-4 h-4" /> },
      { path: '/dao', label: 'DAO', icon: <Users className="w-4 h-4" /> },
    ] : []),
    ...(userRole === 'FIELD_AGENT' ? [
      { path: '/verify', label: 'Verify', icon: <UserCheck className="w-4 h-4" /> },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">ReliefChain</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button 
                variant={location.pathname === link.path ? 'secondary' : 'ghost'} 
                size="sm"
                className="gap-2"
              >
                {link.icon}
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Role Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {roleInfo.icon}
                <span className="hidden sm:inline">{roleInfo.label}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(roleConfig).map(([role, config]) => (
                <DropdownMenuItem 
                  key={role}
                  onClick={() => setUserRole(role as UserRole)}
                  className="gap-2"
                >
                  {config.icon}
                  {config.label}
                  {userRole === role && <Badge variant="default" className="ml-auto">Active</Badge>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet Connection */}
          {wallet.connected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" size="sm" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">{formatAddress(wallet.address!)}</span>
                  <Badge variant="success" className="hidden sm:inline-flex">
                    {formatCurrency(wallet.balance)}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="font-semibold">{formatCurrency(wallet.balance)}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <span className="text-xs text-muted-foreground">Address</span>
                  <span className="font-mono text-xs">{wallet.address}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="wallet" size="sm" onClick={connectWallet} className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect</span>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <div className="container py-4 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button 
                  variant={location.pathname === link.path ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-2"
                >
                  {link.icon}
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
