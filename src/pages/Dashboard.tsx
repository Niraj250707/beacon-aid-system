import React from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import BeneficiaryDashboard from '@/components/dashboards/BeneficiaryDashboard';
import MerchantDashboard from '@/components/dashboards/MerchantDashboard';
import DonorDashboard from '@/components/dashboards/DonorDashboard';
import FieldAgentDashboard from '@/components/dashboards/FieldAgentDashboard';
import { useWallet } from '@/contexts/WalletContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const Dashboard: React.FC = () => {
  const { userRole, wallet } = useWallet();

  // Enable real-time notifications for the current user
  useRealtimeNotifications({ 
    userAddress: wallet.address || undefined 
  });

  const renderDashboard = () => {
    switch (userRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'BENEFICIARY':
        return <BeneficiaryDashboard />;
      case 'MERCHANT':
        return <MerchantDashboard />;
      case 'DONOR':
        return <DonorDashboard />;
      case 'FIELD_AGENT':
        return <FieldAgentDashboard />;
      default:
        return <BeneficiaryDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
