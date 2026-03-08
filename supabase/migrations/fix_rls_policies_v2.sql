-- =============================================
-- FIX RLS POLICIES V2 - Run this in Supabase SQL Editor
-- Fixes:
-- 1. admin_users infinite recursion
-- 2. payment_gateways INSERT policy
-- 3. All new admin tables INSERT policies
-- =============================================

-- STEP 1: Disable RLS on admin_users to prevent infinite recursion
-- This table is for internal admin checks only
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;

-- Drop the problematic recursive policies on admin_users
DROP POLICY IF EXISTS "admin_users_select_admin" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_all_owner" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_delete" ON public.admin_users;

-- STEP 2: Create helper function for admin check that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Also check by profiles.role
CREATE OR REPLACE FUNCTION public.check_is_admin_by_profile()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.check_is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin TO anon;
GRANT EXECUTE ON FUNCTION public.check_is_admin_by_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin_by_profile TO anon;

-- STEP 3: Fix templates table policies
DROP POLICY IF EXISTS "Admin all templates" ON public.templates;
DROP POLICY IF EXISTS "Public read templates" ON public.templates;
DROP POLICY IF EXISTS "templates_admin_all" ON public.templates;
DROP POLICY IF EXISTS "templates_public_read" ON public.templates;

CREATE POLICY "templates_admin_all" ON public.templates
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "templates_public_read" ON public.templates
  FOR SELECT USING (is_visible = true);

-- STEP 4: Fix payment_gateways table policies
DROP POLICY IF EXISTS "Admin all payment_gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "Public read payment_gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "payment_gateways_admin_all" ON public.payment_gateways;
DROP POLICY IF EXISTS "payment_gateways_public_read" ON public.payment_gateways;

CREATE POLICY "payment_gateways_admin_all" ON public.payment_gateways
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "payment_gateways_public_read" ON public.payment_gateways
  FOR SELECT USING (is_enabled = true);

-- STEP 5: Fix payment_transactions table policies
DROP POLICY IF EXISTS "Admin all payment_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_admin_all" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_user_own" ON public.payment_transactions;

CREATE POLICY "payment_transactions_admin_all" ON public.payment_transactions
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "payment_transactions_user_own" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- STEP 6: Fix auth_config table policies  
DROP POLICY IF EXISTS "Admin all auth_config" ON public.auth_config;
DROP POLICY IF EXISTS "auth_config_admin_all" ON public.auth_config;

CREATE POLICY "auth_config_admin_all" ON public.auth_config
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

-- STEP 7: Fix prompt_history table policies
DROP POLICY IF EXISTS "Admin all prompt_history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users view own prompt_history" ON public.prompt_history;
DROP POLICY IF EXISTS "prompt_history_admin_all" ON public.prompt_history;
DROP POLICY IF EXISTS "prompt_history_user_own" ON public.prompt_history;
DROP POLICY IF EXISTS "prompt_history_select_own_or_admin" ON public.prompt_history;
DROP POLICY IF EXISTS "prompt_history_insert_own" ON public.prompt_history;
DROP POLICY IF EXISTS "prompt_history_delete_own_or_admin" ON public.prompt_history;

CREATE POLICY "prompt_history_admin_all" ON public.prompt_history
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "prompt_history_user_own" ON public.prompt_history
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- STEP 8: Fix chat_history table policies
DROP POLICY IF EXISTS "Admin all chat_history" ON public.chat_history;
DROP POLICY IF EXISTS "Users view own chat_history" ON public.chat_history;
DROP POLICY IF EXISTS "chat_history_admin_all" ON public.chat_history;
DROP POLICY IF EXISTS "chat_history_user_own" ON public.chat_history;

CREATE POLICY "chat_history_admin_all" ON public.chat_history
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "chat_history_user_own" ON public.chat_history
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- STEP 9: Fix profiles table policies to prevent recursion
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON public.profiles;

-- Users can read/update their own profile
CREATE POLICY "profiles_user_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_user_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can do everything (use admin_users check to avoid profiles recursion)
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.check_is_admin())
  WITH CHECK (public.check_is_admin());

-- STEP 10: Ensure tables have RLS enabled
ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auth_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 11: Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Verify the fix
SELECT 'RLS Fix Applied Successfully!' as status;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admin_users', 'templates', 'payment_gateways', 'auth_config', 'profiles');
