import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Users, 
  Store, 
  Heart, 
  Wallet,
  ArrowRight,
  CheckCircle2,
  Globe,
  Lock,
  Zap
} from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    { icon: Shield, title: 'Transparent Distribution', desc: 'Every transaction recorded on blockchain' },
    { icon: Users, title: 'Direct Aid', desc: 'Funds reach beneficiaries instantly' },
    { icon: Store, title: 'Local Merchants', desc: 'Support verified local businesses' },
    { icon: Heart, title: 'Donor Governance', desc: 'DAO voting for program decisions' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        
        <div className="relative container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center stagger-children">
            <Badge variant="info" className="mb-6">
              <Zap className="w-3 h-3 mr-1" />
              Blockchain-Powered Relief
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Emergency & Disaster
              <span className="text-gradient block mt-2">Relief System</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A transparent stablecoin platform for governments and NGOs to distribute 
              disaster relief directly to verified beneficiaries via QR tap-and-pay.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Card key={i} variant="stat" className="group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-20 border-t border-border">
        <div className="grid gap-8 md:grid-cols-4 text-center">
          {[
            { value: '₹16.5Cr', label: 'Total Distributed' },
            { value: '5,500+', label: 'Families Helped' },
            { value: '175', label: 'Verified Merchants' },
            { value: '3', label: 'Active Programs' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</p>
              <p className="text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">ReliefChain</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for humanitarian impact. Powered by blockchain.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
