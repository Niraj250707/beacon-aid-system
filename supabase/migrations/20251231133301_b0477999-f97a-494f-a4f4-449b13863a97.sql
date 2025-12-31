-- Create custom types for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'donor', 'beneficiary', 'merchant', 'field_agent');
CREATE TYPE public.program_status AS ENUM ('draft', 'active', 'paused', 'completed', 'closed');
CREATE TYPE public.disaster_type AS ENUM ('flood', 'earthquake', 'cyclone', 'drought', 'pandemic', 'fire', 'other');
CREATE TYPE public.merchant_category AS ENUM ('food', 'health', 'shelter', 'fuel', 'other');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.beneficiary_status AS ENUM ('pending', 'verified', 'active', 'suspended');
CREATE TYPE public.merchant_status AS ENUM ('pending', 'verified', 'active', 'suspended', 'flagged');
CREATE TYPE public.transaction_type AS ENUM ('airdrop', 'payment', 'cashout', 'clawback', 'donation');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE public.proposal_status AS ENUM ('pending', 'active', 'passed', 'rejected', 'executed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  wallet_address TEXT,
  state TEXT,
  district TEXT,
  village TEXT,
  kyc_hash TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  disaster_type disaster_type NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
  distributed_amount DECIMAL(15,2) DEFAULT 0,
  per_household_allocation DECIMAL(10,2) NOT NULL,
  daily_limit DECIMAL(10,2) NOT NULL,
  status program_status DEFAULT 'draft',
  beneficiary_count INTEGER DEFAULT 0,
  merchant_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create beneficiaries table
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  household_size INTEGER DEFAULT 1,
  total_received DECIMAL(15,2) DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  daily_spent DECIMAL(10,2) DEFAULT 0,
  last_transaction_date TIMESTAMP WITH TIME ZONE,
  status beneficiary_status DEFAULT 'pending',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create merchants table
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  business_name TEXT NOT NULL,
  category merchant_category NOT NULL,
  total_received DECIMAL(15,2) DEFAULT 0,
  total_cashed_out DECIMAL(15,2) DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  risk_level risk_level DEFAULT 'low',
  risk_reason TEXT,
  status merchant_status DEFAULT 'pending',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type transaction_type NOT NULL,
  category merchant_category,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status transaction_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  total_donated DECIMAL(15,2) DEFAULT 0,
  voting_power INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create donor_programs junction table
CREATE TABLE public.donor_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  amount_donated DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (donor_id, program_id)
);

-- Create proposals table for DAO
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  proposer_address TEXT NOT NULL,
  proposed_field TEXT NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  proposed_value DECIMAL(15,2) NOT NULL,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  status proposal_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  voting_ends_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_for BOOLEAN NOT NULL,
  voting_power INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (proposal_id, voter_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Field agents can view profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'field_agent'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Programs policies (public read, admin write)
CREATE POLICY "Anyone can view active programs"
  ON public.programs FOR SELECT
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage programs"
  ON public.programs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Beneficiaries policies
CREATE POLICY "Beneficiaries can view their own data"
  ON public.beneficiaries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage beneficiaries"
  ON public.beneficiaries FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Field agents can view beneficiaries"
  ON public.beneficiaries FOR SELECT
  USING (public.has_role(auth.uid(), 'field_agent'));

CREATE POLICY "Field agents can update beneficiaries"
  ON public.beneficiaries FOR UPDATE
  USING (public.has_role(auth.uid(), 'field_agent'));

-- Merchants policies
CREATE POLICY "Merchants can view their own data"
  ON public.merchants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage merchants"
  ON public.merchants FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Beneficiaries can view active merchants"
  ON public.merchants FOR SELECT
  USING (status = 'active');

-- Transactions policies
CREATE POLICY "Users can view their transactions"
  ON public.transactions FOR SELECT
  USING (
    from_address IN (SELECT wallet_address FROM public.profiles WHERE user_id = auth.uid())
    OR to_address IN (SELECT wallet_address FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage transactions"
  ON public.transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view confirmed transactions"
  ON public.transactions FOR SELECT
  USING (status = 'confirmed');

-- Donors policies
CREATE POLICY "Donors can view their own data"
  ON public.donors FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Donors can update their own data"
  ON public.donors FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all donors"
  ON public.donors FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Donor programs policies
CREATE POLICY "Donors can view their programs"
  ON public.donor_programs FOR SELECT
  USING (donor_id IN (SELECT id FROM public.donors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all donor programs"
  ON public.donor_programs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Proposals policies
CREATE POLICY "Anyone can view proposals"
  ON public.proposals FOR SELECT
  USING (true);

CREATE POLICY "Donors can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'donor'));

CREATE POLICY "Admins can manage proposals"
  ON public.proposals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Votes policies
CREATE POLICY "Donors can vote"
  ON public.votes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'donor') AND voter_id = auth.uid());

CREATE POLICY "Users can view their votes"
  ON public.votes FOR SELECT
  USING (voter_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  -- Default role is beneficiary
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'beneficiary');
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();