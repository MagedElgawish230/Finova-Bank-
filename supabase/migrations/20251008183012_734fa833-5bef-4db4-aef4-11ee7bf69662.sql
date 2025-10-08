-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  account_number text UNIQUE NOT NULL,
  balance decimal(15, 2) DEFAULT 0.00 NOT NULL,
  phone text,
  email text NOT NULL,
  mfa_enabled boolean DEFAULT false,
  mfa_code text,
  mfa_expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_account_number text NOT NULL,
  to_account_number text NOT NULL,
  amount decimal(15, 2) NOT NULL CHECK (amount > 0),
  transaction_type text NOT NULL CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal')),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create contact messages table
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles by account number"
  ON public.profiles FOR SELECT
  USING (true);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- RLS Policies for contact messages
CREATE POLICY "Users can view their own messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to generate unique account number
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_account_number text;
  account_exists boolean;
BEGIN
  LOOP
    -- Generate 10-digit account number
    new_account_number := LPAD(FLOOR(RANDOM() * 10000000000)::text, 10, '0');
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE account_number = new_account_number) INTO account_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT account_exists;
  END LOOP;
  
  RETURN new_account_number;
END;
$$;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, account_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    public.generate_account_number()
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();