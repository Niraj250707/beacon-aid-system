import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Mail, Lock, User, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AppRole = 'admin' | 'donor' | 'beneficiary' | 'merchant' | 'field_agent';

const roleOptions: { value: AppRole; label: string }[] = [
  { value: 'beneficiary', label: 'Beneficiary (Aid Recipient)' },
  { value: 'donor', label: 'Donor (Fund Provider)' },
  { value: 'merchant', label: 'Merchant (Local Vendor)' },
  { value: 'field_agent', label: 'Field Agent (Verification)' },
];

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState<{ email?: string; password?: string }>({});
  
  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<AppRole>('beneficiary');
  const [signUpErrors, setSignUpErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validateSignIn = () => {
    const errors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(signInEmail);
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(signInPassword);
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }
    
    setSignInErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignUp = () => {
    const errors: { name?: string; email?: string; password?: string } = {};
    
    const nameResult = nameSchema.safeParse(signUpName);
    if (!nameResult.success) {
      errors.name = nameResult.error.errors[0].message;
    }
    
    const emailResult = emailSchema.safeParse(signUpEmail);
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(signUpPassword);
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }
    
    setSignUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;
    
    setIsLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setIsLoading(false);
    
    if (!error) {
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;
    
    setIsLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, signUpName, signUpRole);
    setIsLoading(false);
    
    if (!error) {
      setActiveTab('signin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-info/10 blur-3xl animate-pulse-glow" />
      
      <Card className="w-full max-w-md relative z-10 glass">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">ReliefChain</span>
          </Link>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to access your disaster relief dashboard
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mx-6" style={{ width: 'calc(100% - 48px)' }}>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signInErrors.email && (
                    <p className="text-sm text-destructive">{signInErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signInErrors.password && (
                    <p className="text-sm text-destructive">{signInErrors.password}</p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signUpErrors.name && (
                    <p className="text-sm text-destructive">{signUpErrors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signUpErrors.email && (
                    <p className="text-sm text-destructive">{signUpErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signUpErrors.password && (
                    <p className="text-sm text-destructive">{signUpErrors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Account Type</Label>
                  <Select value={signUpRole} onValueChange={(v) => setSignUpRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Admin accounts require separate approval
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
