-- =============================================
-- SIMPLE ADMIN ACCESS FIX - Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Make sure admin_users table has RLS disabled (admins table)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Step 2: Re-enable RLS on data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'user_profiles', 'user_credits', 'credit_transactions', 'prompt_history')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Step 4: Create simple policies with INLINE admin check (no function dependency)

-- PROFILES
CREATE POLICY "profiles_user_select" ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));
  
CREATE POLICY "profiles_user_insert" ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
  
CREATE POLICY "profiles_user_update" ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));

-- USER_PROFILES  
CREATE POLICY "user_profiles_user_select" ON public.user_profiles FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));
  
CREATE POLICY "user_profiles_user_insert" ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "user_profiles_user_update" ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));

-- USER_CREDITS
CREATE POLICY "user_credits_user_select" ON public.user_credits FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));
  
CREATE POLICY "user_credits_user_insert" ON public.user_credits FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "user_credits_user_update" ON public.user_credits FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));

-- CREDIT_TRANSACTIONS
CREATE POLICY "credit_transactions_user_select" ON public.credit_transactions FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));
  
CREATE POLICY "credit_transactions_user_insert" ON public.credit_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));

-- PROMPT_HISTORY
CREATE POLICY "prompt_history_user_select" ON public.prompt_history FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));
  
CREATE POLICY "prompt_history_user_insert" ON public.prompt_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "prompt_history_user_delete" ON public.prompt_history FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));

-- Step 5: Ensure subscriptions table exists and has proper policies (for Revenue page)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  amount DECIMAL(10,2) DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  next_billing_date TIMESTAMPTZ,
  payment_method TEXT DEFAULT 'card',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_user_select" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_all" ON subscriptions;

CREATE POLICY "subscriptions_user_select" ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));
  
CREATE POLICY "subscriptions_admin_all" ON subscriptions FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'owner')));

-- Step 6: Make sure admin is in admin_users
INSERT INTO admin_users (user_id, role)
SELECT id, 'owner' 
FROM auth.users 
WHERE email = 'admin@promptforge.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'owner';

-- Step 7: Verify setup
SELECT 'Admin users:' as info;
SELECT au.*, p.email 
FROM admin_users au 
LEFT JOIN profiles p ON au.user_id = p.id;

SELECT 'Policies created:' as info;
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
