-- Fix Supabase Security Lints
-- This migration enables RLS on all tables and fixes security definer views

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on prompt_history
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Enable RLS on prompt_templates
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FIX SECURITY DEFINER VIEWS
-- Change from SECURITY DEFINER to SECURITY INVOKER
-- ============================================

-- Fix user_cohort_analysis view
ALTER VIEW public.user_cohort_analysis SET (security_invoker = on);

-- Fix category_analytics view
ALTER VIEW public.category_analytics SET (security_invoker = on);

-- Fix daily_analytics view
ALTER VIEW public.daily_analytics SET (security_invoker = on);

-- ============================================
-- 3. ADD MISSING RLS POLICIES FOR analytics_events
-- (This table didn't have policies defined)
-- ============================================

-- Allow authenticated users to insert their own events
DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to view their own events
DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to view all analytics events
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Allow service role full access (for backend operations)
DROP POLICY IF EXISTS "Service role has full access to analytics" ON public.analytics_events;
CREATE POLICY "Service role has full access to analytics"
  ON public.analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
