-- =============================================
-- FIX ADMIN RLS - Run this in Supabase SQL Editor
-- =============================================

-- Drop and recreate is_admin function with proper security
DROP FUNCTION IF EXISTS public.is_admin(UUID);

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_to_check UUID;
BEGIN
  -- Use provided ID or current user
  user_to_check := COALESCE(check_user_id, auth.uid());
  
  IF user_to_check IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_to_check 
    AND role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies first
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

-- PROFILES policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- USER_PROFILES policies
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_admin_select" ON public.user_profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "user_profiles_admin_all" ON public.user_profiles
  FOR ALL USING (public.is_admin());

-- USER_CREDITS policies
CREATE POLICY "user_credits_select_own" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_credits_update_own" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_credits_insert_own" ON public.user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_credits_admin_select" ON public.user_credits
  FOR SELECT USING (public.is_admin());
CREATE POLICY "user_credits_admin_all" ON public.user_credits
  FOR ALL USING (public.is_admin());

-- CREDIT_TRANSACTIONS policies
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credit_transactions_insert_own" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "credit_transactions_admin_select" ON public.credit_transactions
  FOR SELECT USING (public.is_admin());
CREATE POLICY "credit_transactions_admin_insert" ON public.credit_transactions
  FOR INSERT WITH CHECK (public.is_admin());

-- PROMPT_HISTORY policies
CREATE POLICY "prompt_history_select_own" ON public.prompt_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prompt_history_insert_own" ON public.prompt_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompt_history_delete_own" ON public.prompt_history
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "prompt_history_admin_select" ON public.prompt_history
  FOR SELECT USING (public.is_admin());
CREATE POLICY "prompt_history_admin_delete" ON public.prompt_history
  FOR DELETE USING (public.is_admin());

-- Verify admin user exists
INSERT INTO admin_users (user_id, role)
SELECT id, 'owner' FROM profiles WHERE email = 'admin@promptforge.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'owner';

-- Test the function
SELECT public.is_admin('ad8c7c1a-eb3c-4de6-955d-25fb898b28aa') as admin_check;
