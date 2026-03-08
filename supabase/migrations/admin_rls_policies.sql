-- =============================================
-- ADMIN RLS POLICIES
-- =============================================
-- Run this in Supabase SQL Editor AFTER schema.sql
-- This adds policies allowing admins to read all data
-- =============================================

-- Drop existing admin policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all credits" ON public.user_credits;
DROP POLICY IF EXISTS "Admins can update all credits" ON public.user_credits;
DROP POLICY IF EXISTS "Admins can insert credits" ON public.user_credits;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admins can view all prompt_history" ON public.prompt_history;
DROP POLICY IF EXISTS "Admins can delete prompt_history" ON public.prompt_history;
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;

-- PROFILES - Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- PROFILES - Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

-- USER PROFILES - Admins can view all user_profiles
CREATE POLICY "Admins can view all user_profiles" ON public.user_profiles
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- USER PROFILES - Admins can update all user_profiles
CREATE POLICY "Admins can update all user_profiles" ON public.user_profiles
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

-- USER PROFILES - Admins can insert user_profiles
CREATE POLICY "Admins can insert user_profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

-- USER CREDITS - Admins can view all credits
CREATE POLICY "Admins can view all credits" ON public.user_credits
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- USER CREDITS - Admins can update all credits
CREATE POLICY "Admins can update all credits" ON public.user_credits
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

-- USER CREDITS - Admins can insert credits
CREATE POLICY "Admins can insert credits" ON public.user_credits
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

-- CREDIT TRANSACTIONS - Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- CREDIT TRANSACTIONS - Admins can insert transactions for any user
CREATE POLICY "Admins can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

-- PROMPT HISTORY - Admins can view all history
CREATE POLICY "Admins can view all prompt_history" ON public.prompt_history
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- PROMPT HISTORY - Admins can delete any history
CREATE POLICY "Admins can delete prompt_history" ON public.prompt_history
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

-- ANALYTICS EVENTS - Admins can view all analytics
CREATE POLICY "Admins can view analytics" ON public.analytics_events
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- =============================================
-- ADMIN TABLES POLICIES (from admin_tables.sql)
-- =============================================

-- SUPPORT TICKETS - Admins can manage all tickets
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'support_tickets') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets';
    EXECUTE 'CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (public.is_admin(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins can update all tickets" ON public.support_tickets FOR UPDATE USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- AUDIT LOGS - Admins can view all logs
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_logs') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs';
    EXECUTE 'CREATE POLICY "Admins can view audit_logs" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- FEATURE FLAGS - Admins can manage flags
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'feature_flags') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view feature_flags" ON public.feature_flags';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage feature_flags" ON public.feature_flags';
    EXECUTE 'CREATE POLICY "Admins can view feature_flags" ON public.feature_flags FOR SELECT USING (public.is_admin(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins can manage feature_flags" ON public.feature_flags FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ADMIN NOTIFICATIONS - Admins can manage notifications
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_notifications') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view admin_notifications" ON public.admin_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage admin_notifications" ON public.admin_notifications';
    EXECUTE 'CREATE POLICY "Admins can view admin_notifications" ON public.admin_notifications FOR SELECT USING (public.is_admin(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins can manage admin_notifications" ON public.admin_notifications FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- SUBSCRIPTIONS - Admins can manage subscriptions
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subscriptions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view subscriptions" ON public.subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions';
    EXECUTE 'CREATE POLICY "Admins can view subscriptions" ON public.subscriptions FOR SELECT USING (public.is_admin(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins can update subscriptions" ON public.subscriptions FOR UPDATE USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- PROMPT TEMPLATES - Admins can manage templates
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'prompt_templates') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view templates" ON public.prompt_templates';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage templates" ON public.prompt_templates';
    EXECUTE 'CREATE POLICY "Anyone can view templates" ON public.prompt_templates FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins can manage templates" ON public.prompt_templates FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- AI MODELS - Admins can manage AI models
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_models') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view ai_models" ON public.ai_models';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage ai_models" ON public.ai_models';
    EXECUTE 'CREATE POLICY "Anyone can view ai_models" ON public.ai_models FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins can manage ai_models" ON public.ai_models FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;
