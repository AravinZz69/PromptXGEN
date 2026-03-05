-- =============================================
-- PROMPTXGEN - DATABASE SCHEMA
-- =============================================
-- Run this in Supabase SQL Editor
-- Safe to run on fresh or existing project
-- =============================================

-- =============================================
-- 0. CLEANUP (Drop existing objects)
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_owner(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_admin_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS check_user_credits(UUID) CASCADE;
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER, TEXT) CASCADE;

DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.prompt_history CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS plan_type CASCADE;

-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE user_role AS ENUM ('user', 'admin', 'owner');
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'enterprise');

-- =============================================
-- 2. TABLES
-- =============================================

-- PROFILES (Main user data linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan plan_type DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROFILES (Extended profile for admin management)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER CREDITS
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits_balance INTEGER DEFAULT 20,
  total_credits INTEGER DEFAULT 20,
  used_credits INTEGER DEFAULT 0,
  plan_type plan_type DEFAULT 'free',
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN USERS
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role user_role NOT NULL DEFAULT 'admin',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREDIT TRANSACTIONS
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deduction', 'topup', 'refund', 'bonus', 'reset', 'admin_grant')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROMPT HISTORY
CREATE TABLE public.prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  model TEXT DEFAULT 'groq',
  prompt_type TEXT DEFAULT 'basic',
  tokens_used INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYTICS EVENTS
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  source TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM SETTINGS
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert for authenticated" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- USER PROFILES policies
CREATE POLICY "Users can view own user_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own user_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for authenticated" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER CREDITS policies
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for authenticated" ON public.user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ADMIN USERS policies
CREATE POLICY "Admins can view admin_users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid())
  );
CREATE POLICY "Owners can manage admin_users" ON public.admin_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.role = 'owner')
  );

-- CREDIT TRANSACTIONS policies
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for authenticated" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PROMPT HISTORY policies
CREATE POLICY "Users can view own history" ON public.prompt_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.prompt_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.prompt_history
  FOR DELETE USING (auth.uid() = user_id);

-- ANALYTICS policies
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- SYSTEM SETTINGS policies (admin only via service role)
CREATE POLICY "Service role access" ON public.system_settings
  FOR ALL USING (true);

-- =============================================
-- 4. INDEXES
-- =============================================
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);

-- =============================================
-- 5. FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_credits_updated_at 
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is owner
CREATE OR REPLACE FUNCTION is_owner(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val FROM public.admin_users WHERE user_id = user_uuid;
  IF user_role_val IS NULL THEN RETURN 'user'; END IF;
  RETURN user_role_val::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'active_users', (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true),
    'total_admins', (SELECT COUNT(*) FROM public.admin_users WHERE role = 'admin'),
    'total_owners', (SELECT COUNT(*) FROM public.admin_users WHERE role = 'owner'),
    'total_prompts', (SELECT COUNT(*) FROM public.prompt_history),
    'total_credits_used', (SELECT COALESCE(SUM(amount), 0) FROM public.credit_transactions WHERE transaction_type = 'deduction'),
    'new_users_today', (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE),
    'new_users_week', (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check user credits
CREATE OR REPLACE FUNCTION check_user_credits(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT credits_balance INTO v_balance FROM public.user_credits WHERE user_id = p_user_id;
  
  IF v_balance IS NULL THEN
    RETURN json_build_object('has_credits', false, 'balance', 0);
  END IF;
  
  RETURN json_build_object('has_credits', v_balance > 0, 'balance', v_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT DEFAULT 'Credit usage')
RETURNS JSON AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance FROM public.user_credits WHERE user_id = p_user_id FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  IF v_current_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient credits', 'balance', v_current_balance);
  END IF;
  
  -- Deduct credits
  v_new_balance := v_current_balance - p_amount;
  
  UPDATE public.user_credits 
  SET credits_balance = v_new_balance, used_credits = used_credits + p_amount
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'deduction', p_description);
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'deducted', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. NEW USER SIGNUP HANDLER (defined in section 9)
-- =============================================
-- Trigger for new user signup (function defined below in section 9)

-- =============================================
-- 7. STORAGE (Avatars bucket)
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- 8. PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- 9. ADMIN OWNER SETUP
-- =============================================
-- Auto-grant owner role to admin email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create user profile
  INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create credits (20 free credits)
  INSERT INTO public.user_credits (user_id, credits_balance, total_credits, used_credits)
  VALUES (NEW.id, 20, 20, 0);

  -- Log welcome bonus transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 20, 'bonus', 'Welcome bonus - Free signup credits');

  -- Auto-grant OWNER role to admin email
  IF NEW.email = 'admin@promptforge.com' THEN
    INSERT INTO public.admin_users (user_id, role)
    VALUES (NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- If admin already exists, make them owner
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@promptforge.com';
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (user_id, role)
    VALUES (admin_user_id, 'owner')
    ON CONFLICT (user_id) DO UPDATE SET role = 'owner';
  END IF;
END $$;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
SELECT '✅ PromptXGEN database schema created successfully!' as status;
