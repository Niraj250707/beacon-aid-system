import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import Beneficiaries from "./pages/Beneficiaries";
import Merchants from "./pages/Merchants";
import Pay from "./pages/Pay";
import Donate from "./pages/Donate";
import Verify from "./pages/Verify";
import Transactions from "./pages/Transactions";
import Governance from "./pages/Governance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/beneficiaries" element={<Beneficiaries />} />
            <Route path="/merchants" element={<Merchants />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/dao" element={<Governance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
