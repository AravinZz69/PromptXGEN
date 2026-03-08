-- =============================================
-- PAYMENTS & AUTH CONFIG TABLES
-- =============================================
-- This file contains tables missing from earlier scripts:
-- payment_gateways, payment_transactions, auth_config
-- Also adds permissions column to admin_users
-- =============================================
-- Run this in Supabase SQL Editor AFTER 01-05 scripts
-- =============================================



-- =============================================
-- SECTION 1: ADD PERMISSIONS COLUMN TO ADMIN_USERS
-- =============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'admin_users' 
                   AND column_name = 'permissions') THEN
        ALTER TABLE public.admin_users ADD COLUMN permissions JSONB DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'admin_users' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.admin_users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;



-- =============================================
-- SECTION 2: PAYMENT GATEWAYS TABLE
-- =============================================
-- Stores configuration for Razorpay, Stripe, PayPal etc.

CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "payment_gateways_public_read" ON public.payment_gateways;
DROP POLICY IF EXISTS "payment_gateways_admin_all" ON public.payment_gateways;

-- Anyone can read enabled gateways (for pricing page)
CREATE POLICY "payment_gateways_public_read" ON public.payment_gateways
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "payment_gateways_admin_all" ON public.payment_gateways
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Seed default gateways
INSERT INTO public.payment_gateways (name, display_name, is_enabled, is_test_mode, config)
VALUES
  ('razorpay', 'Razorpay', false, true, '{"key_id": "", "key_secret": "", "webhook_secret": ""}'),
  ('stripe', 'Stripe', false, true, '{"api_key": "", "api_secret": "", "webhook_secret": ""}'),
  ('paypal', 'PayPal', false, true, '{"client_id": "", "client_secret": ""}')
ON CONFLICT (name) DO NOTHING;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS payment_gateways_updated_at ON public.payment_gateways;
CREATE TRIGGER payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();



-- =============================================
-- SECTION 3: PAYMENT TRANSACTIONS TABLE
-- =============================================
-- Records all payment attempts and successful transactions

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  gateway TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded', 'cancelled')),
  transaction_id TEXT,
  plan_name TEXT,
  credits_purchased INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON public.payment_transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "payment_transactions_select_own_or_admin" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_insert_own" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_update_admin" ON public.payment_transactions;

-- Users can view their own transactions
CREATE POLICY "payment_transactions_select_own_or_admin" ON public.payment_transactions
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Users can insert their own transactions
CREATE POLICY "payment_transactions_insert_own" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can update transactions (for refunds etc.)
CREATE POLICY "payment_transactions_update_admin" ON public.payment_transactions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();



-- =============================================
-- SECTION 4: AUTH CONFIG TABLE
-- =============================================
-- Stores authentication provider configurations

CREATE TABLE IF NOT EXISTS public.auth_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.auth_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "auth_config_public_read" ON public.auth_config;
DROP POLICY IF EXISTS "auth_config_admin_all" ON public.auth_config;

-- Anyone can read (frontend needs to know which providers are enabled)
CREATE POLICY "auth_config_public_read" ON public.auth_config
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "auth_config_admin_all" ON public.auth_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS auth_config_updated_at ON public.auth_config;
CREATE TRIGGER auth_config_updated_at
  BEFORE UPDATE ON public.auth_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();



-- =============================================
-- SECTION 5: GRANTS
-- =============================================
GRANT ALL ON public.payment_gateways TO authenticated;
GRANT ALL ON public.payment_gateways TO service_role;
GRANT SELECT ON public.payment_gateways TO anon;

GRANT ALL ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;

GRANT ALL ON public.auth_config TO authenticated;
GRANT ALL ON public.auth_config TO service_role;
GRANT SELECT ON public.auth_config TO anon;



-- =============================================
-- VERIFICATION
-- =============================================
SELECT '✅ Payments & Auth Config tables created!' as status;
SELECT 'payment_gateways' as table_name, COUNT(*) as count FROM payment_gateways
UNION ALL
SELECT 'payment_transactions', COUNT(*) FROM payment_transactions
UNION ALL
SELECT 'auth_config', COUNT(*) FROM auth_config;
