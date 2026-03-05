-- =============================================
-- ADMIN ACCESS FIX - Run this in Supabase SQL Editor
-- This enables admins to view all user data
-- =============================================

-- STEP 1: Create/Update the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_to_check UUID;
BEGIN
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

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- STEP 2: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- STEP 3: Drop ALL existing policies on these tables
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'user_profiles', 'user_credits', 'credit_transactions', 'prompt_history', 'admin_users')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- STEP 4: Create new policies

-- PROFILES policies
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- USER_PROFILES policies
CREATE POLICY "user_profiles_select_own_or_admin" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_profiles_update_own_or_admin" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_profiles_insert_own_or_admin" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_profiles_delete_admin" ON public.user_profiles
  FOR DELETE USING (public.is_admin());

-- USER_CREDITS policies
CREATE POLICY "user_credits_select_own_or_admin" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_credits_update_own_or_admin" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_credits_insert_own_or_admin" ON public.user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- CREDIT_TRANSACTIONS policies
CREATE POLICY "credit_transactions_select_own_or_admin" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "credit_transactions_insert_own_or_admin" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- PROMPT_HISTORY policies
CREATE POLICY "prompt_history_select_own_or_admin" ON public.prompt_history
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "prompt_history_insert_own" ON public.prompt_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompt_history_delete_own_or_admin" ON public.prompt_history
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ADMIN_USERS policies
CREATE POLICY "admin_users_select_admin" ON public.admin_users
  FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_users_all_owner" ON public.admin_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'owner')
  );

-- STEP 5: Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- STEP 6: Ensure current admin user is set up
-- Replace with your admin email if different
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'promptgen00@gmail.com';
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (user_id, role)
    VALUES (admin_user_id, 'owner')
    ON CONFLICT (user_id) DO UPDATE SET role = 'owner';
    RAISE NOTICE 'Admin user set as owner: %', admin_user_id;
  END IF;
END $$;

-- Verify setup
SELECT 'Admin users:' as info, user_id, role FROM admin_users;
SELECT 'is_admin check:' as info, public.is_admin() as is_admin;

-- =============================================
-- DONE! Refresh the admin portal.
-- =============================================
