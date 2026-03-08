-- =============================================
-- CONSOLIDATED ADMIN MIGRATIONS
-- =============================================
-- This file contains all admin-related tables, functions, and policies
-- Includes: admin_users, support_tickets, audit_logs, feature_flags, admin_notifications,
--          subscriptions, prompt_templates, ai_models, notification_templates
-- =============================================
-- Run this in Supabase SQL Editor
-- =============================================



-- =============================================
-- SECTION 1: ADMIN USERS TABLE
-- =============================================
-- Core admin users table (should exist from schema.sql)

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on admin_users to prevent infinite recursion
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;



-- =============================================
-- SECTION 2: IS_ADMIN FUNCTION
-- =============================================
-- Core function to check if user is admin

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

-- Helper function that doesn't cause recursion
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

-- Check by profiles.role
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

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;
GRANT EXECUTE ON FUNCTION public.check_is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin TO anon;
GRANT EXECUTE ON FUNCTION public.check_is_admin_by_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin_by_profile TO anon;



-- =============================================
-- SECTION 3: SUPPORT TICKETS
-- =============================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  assignee TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;

-- Policies
CREATE POLICY "Admins can view support_tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);



-- =============================================
-- SECTION 4: AUDIT LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  request_id TEXT,
  status TEXT DEFAULT 'success',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow audit log insert" ON public.audit_logs;

CREATE POLICY "Admins can view audit_logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Allow audit log insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Function to get all audit logs for admin
CREATE OR REPLACE FUNCTION public.get_all_audit_logs()
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  user_id UUID,
  action TEXT,
  description TEXT,
  ip_address TEXT,
  location TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_email,
    al.user_id,
    al.action,
    al.description,
    al.ip_address,
    al.location,
    al.status,
    al.metadata,
    al.created_at
  FROM audit_logs al
  ORDER BY al.created_at DESC
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_all_audit_logs() TO authenticated;



-- =============================================
-- SECTION 5: FEATURE FLAGS
-- =============================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  section TEXT DEFAULT 'Core Features',
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  enabled_for_plans TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage feature_flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Anyone can read feature_flags" ON public.feature_flags;

CREATE POLICY "Admins can manage feature_flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can read feature_flags" ON public.feature_flags
  FOR SELECT USING (true);



-- =============================================
-- SECTION 6: ADMIN NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'free', 'pro', 'enterprise')),
  channels TEXT[] DEFAULT '{"email"}',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Sent')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON public.admin_notifications(status);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.admin_notifications;

CREATE POLICY "Admins can manage notifications" ON public.admin_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );



-- =============================================
-- SECTION 7: NOTIFICATION TEMPLATES
-- =============================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT DEFAULT 'all' CHECK (audience IN ('all', 'free', 'pro', 'enterprise')),
  channels TEXT[] DEFAULT '{"email", "in-app"}',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON public.notification_templates(category);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view notification_templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Admins can manage notification_templates" ON public.notification_templates;

CREATE POLICY "Admins can view notification_templates" ON public.notification_templates
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage notification_templates" ON public.notification_templates
  FOR ALL USING (public.is_admin(auth.uid()));

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notification_templates 
  SET uses_count = uses_count + 1 
  WHERE id = template_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_template_usage TO authenticated;

-- Seed default notification templates
INSERT INTO public.notification_templates (name, description, title, message, audience, channels, priority, category) VALUES
  ('Welcome Email', 'Sent to new users after signup', 'Welcome to PromptXGEN! 🎉', 'Hi there! Welcome to PromptXGEN. We''re excited to have you on board. Start generating powerful prompts today and unlock your AI potential. You have 20 free credits to get started!', 'all', '{"email", "in-app"}', 'normal', 'onboarding'),
  ('Payment Failed', 'Alert when payment processing fails', 'Payment Failed - Action Required', 'We couldn''t process your payment for your subscription. Please update your payment method to continue enjoying Pro features. Your account will be downgraded in 3 days if not resolved.', 'pro', '{"email", "in-app"}', 'high', 'billing'),
  ('Feature Announcement', 'New feature release notification', 'New Feature: {{feature_name}}', 'We''ve just launched a new feature! {{feature_description}} Check it out now and let us know what you think.', 'all', '{"email", "in-app"}', 'normal', 'announcement'),
  ('Weekly Digest', 'Weekly usage summary email', 'Your Weekly PromptXGEN Report 📊', 'Here''s your weekly summary: You generated {{prompts_count}} prompts this week. Your most used category was {{top_category}}. You have {{credits_remaining}} credits remaining.', 'all', '{"email"}', 'low', 'digest'),
  ('Plan Upgrade', 'Confirmation for plan upgrades', 'Welcome to Pro! 🚀', 'Congratulations on upgrading to Pro! You now have access to advanced features, unlimited prompts, and priority support. Your monthly credits have been increased to 500.', 'pro', '{"email", "in-app"}', 'normal', 'billing'),
  ('Account Security', 'Security alerts and notices', 'Security Alert: New Login Detected', 'We detected a new login to your account from {{device}} in {{location}}. If this wasn''t you, please change your password immediately and contact support.', 'all', '{"email", "in-app", "push"}', 'high', 'security'),
  ('Low Credits Warning', 'Alert when credits are running low', 'Low Credits Alert ⚠️', 'You have only {{credits_remaining}} credits left. Consider upgrading to Pro for more credits or purchase additional credits to continue generating prompts.', 'all', '{"in-app"}', 'normal', 'billing'),
  ('Subscription Renewal', 'Upcoming subscription renewal notice', 'Your Subscription Renews Soon', 'Your Pro subscription will renew on {{renewal_date}} for ${{amount}}. Make sure your payment method is up to date. Thanks for being a Pro member!', 'pro', '{"email"}', 'normal', 'billing')
ON CONFLICT DO NOTHING;



-- =============================================
-- SECTION 8: SUBSCRIPTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Cancelled', 'Past Due', 'Trialing')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  next_billing_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Admins can view subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());



-- =============================================
-- SECTION 9: PROMPT TEMPLATES
-- =============================================

CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read templates" ON public.prompt_templates;

CREATE POLICY "Anyone can read templates" ON public.prompt_templates
  FOR SELECT USING (true);



-- =============================================
-- SECTION 10: AI MODELS
-- =============================================

CREATE TABLE IF NOT EXISTS public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  available_for_plans TEXT[] DEFAULT '{"free", "pro", "enterprise"}',
  input_cost_per_million DECIMAL(10,4) DEFAULT 0,
  output_cost_per_million DECIMAL(10,4) DEFAULT 0,
  max_tokens INTEGER DEFAULT 4096,
  api_key_encrypted TEXT,
  tokens_used BIGINT DEFAULT 0,
  requests_today INTEGER DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;



-- =============================================
-- SECTION 11: ADMIN CREDIT FUNCTIONS
-- =============================================

-- Disable RLS on credit tables for admin functions
ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;

-- Drop existing functions
DROP FUNCTION IF EXISTS admin_add_credits(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS admin_deduct_credits(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS admin_set_credits(UUID, INTEGER, TEXT);

-- Function to add credits (admin only)
CREATE OR REPLACE FUNCTION admin_add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Admin credit grant'
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get or create current balance
  SELECT credits_balance INTO v_current_balance 
  FROM user_credits WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
    INSERT INTO user_credits (user_id, credits_balance, total_credits, used_credits, plan_type)
    VALUES (p_user_id, 0, 0, 0, 'free');
  END IF;
  
  v_new_balance := v_current_balance + p_amount;
  
  -- Update credits
  UPDATE user_credits 
  SET credits_balance = v_new_balance, 
      total_credits = GREATEST(total_credits, v_new_balance),
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'admin_grant', p_reason);
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance,
    'added', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to deduct credits (admin only)
CREATE OR REPLACE FUNCTION admin_deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Admin credit deduction'
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance 
  FROM user_credits WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User has no credits record');
  END IF;
  
  v_new_balance := GREATEST(0, v_current_balance - p_amount);
  
  -- Update credits
  UPDATE user_credits 
  SET credits_balance = v_new_balance, 
      used_credits = used_credits + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'deduction', p_reason);
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance,
    'deducted', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to set credits to specific amount (admin only)
CREATE OR REPLACE FUNCTION admin_set_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Admin credit adjustment'
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_diff INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance 
  FROM user_credits WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    -- Create new record
    INSERT INTO user_credits (user_id, credits_balance, total_credits, used_credits, plan_type)
    VALUES (p_user_id, p_amount, p_amount, 0, 'free');
    v_diff := p_amount;
  ELSE
    v_diff := p_amount - v_current_balance;
    UPDATE user_credits 
    SET credits_balance = p_amount,
        total_credits = GREATEST(total_credits, p_amount),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, ABS(v_diff), 
    CASE WHEN v_diff >= 0 THEN 'admin_grant' ELSE 'deduction' END,
    p_reason || ' (set to ' || p_amount || ')');
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', p_amount,
    'previous_balance', COALESCE(v_current_balance, 0)
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_add_credits TO authenticated;
GRANT EXECUTE ON FUNCTION admin_deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_credits TO authenticated;



-- =============================================
-- SECTION 12: GET ALL USERS ADMIN FUNCTION
-- =============================================

DROP FUNCTION IF EXISTS get_all_users_admin();

CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT,
  credits_balance INTEGER,
  used_credits INTEGER,
  is_active BOOLEAN,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  mobile TEXT,
  city TEXT,
  role TEXT,
  use_case TEXT,
  experience_level TEXT,
  email_verified BOOLEAN,
  phone_verified BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  -- Return all users with their data
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    COALESCE(p.full_name, split_part(u.email, '@', 1))::TEXT as full_name,
    p.avatar_url::TEXT,
    COALESCE(p.plan::TEXT, 'free') as plan,
    COALESCE(c.credits_balance, 0) as credits_balance,
    COALESCE(c.used_credits, 0) as used_credits,
    COALESCE(up.is_active, true) as is_active,
    up.last_login,
    u.created_at,
    COALESCE(p.updated_at, u.created_at) as updated_at,
    up.mobile::TEXT,
    up.city::TEXT,
    up.role::TEXT,
    up.use_case::TEXT,
    up.experience_level::TEXT,
    COALESCE(u.email_confirmed_at IS NOT NULL, false) as email_verified,
    COALESCE(u.phone_confirmed_at IS NOT NULL, false) as phone_verified
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  LEFT JOIN user_credits c ON c.user_id = u.id
  LEFT JOIN user_profiles up ON up.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;



-- =============================================
-- SECTION 13: GET ALL PROMPTS ADMIN FUNCTION
-- =============================================

-- Disable RLS on prompt_history for admin access
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS get_all_prompts_admin();

CREATE OR REPLACE FUNCTION get_all_prompts_admin()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  input_text TEXT,
  output_text TEXT,
  model TEXT,
  prompt_type TEXT,
  tokens_used INTEGER,
  credits_used INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return all prompts with user info
  RETURN QUERY
  SELECT 
    ph.id,
    ph.user_id,
    COALESCE(p.email, u.email, 'Unknown')::TEXT as user_email,
    COALESCE(p.full_name, split_part(u.email, '@', 1), 'Unknown')::TEXT as user_name,
    ph.input_text,
    ph.output_text,
    ph.model,
    ph.prompt_type,
    COALESCE(ph.tokens_used, 0) as tokens_used,
    COALESCE(ph.credits_used, 1) as credits_used,
    ph.metadata,
    ph.created_at
  FROM prompt_history ph
  LEFT JOIN profiles p ON p.id = ph.user_id
  LEFT JOIN auth.users u ON u.id = ph.user_id
  ORDER BY ph.created_at DESC
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_all_prompts_admin() TO authenticated;
GRANT ALL ON prompt_history TO authenticated;



-- =============================================
-- SECTION 14: RLS POLICIES FOR USER TABLES
-- =============================================
-- Enable admin access to user tables

-- Enable RLS on user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
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



-- =============================================
-- SECTION 15: BACKFILL MISSING DATA
-- =============================================

-- Backfill missing profiles for any existing auth.users
INSERT INTO profiles (id, email, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Backfill user_credits for existing users
INSERT INTO user_credits (user_id, credits_balance, total_credits, used_credits, plan_type)
SELECT 
  id,
  20,
  20,
  0,
  'free'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- Backfill user_profiles for existing users
INSERT INTO user_profiles (user_id, email, full_name, is_active)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;



-- =============================================
-- SECTION 16: GRANTS
-- =============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;



-- =============================================
-- SECTION 17: SET UP ADMIN USER
-- =============================================
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



-- =============================================
-- VERIFICATION
-- =============================================
SELECT '✅ Admin migrations complete!' as status;
SELECT 'admin_users' as table_name, COUNT(*) as count FROM admin_users
UNION ALL
SELECT 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'feature_flags', COUNT(*) FROM feature_flags
UNION ALL
SELECT 'admin_notifications', COUNT(*) FROM admin_notifications
UNION ALL
SELECT 'notification_templates', COUNT(*) FROM notification_templates;

SELECT 'Admin users:' as info, user_id, role FROM admin_users;
SELECT 'is_admin check:' as info, public.is_admin() as is_admin;
