-- ══════════════════════════════════════════════════════════════════════════════
-- Payment System Enhancement Migration
-- Add missing columns to payment_transactions for full payment flow support
-- ══════════════════════════════════════════════════════════════════════════════

-- Add missing columns to payment_transactions
ALTER TABLE public.payment_transactions ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.payment_transactions ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE public.payment_transactions ADD COLUMN IF NOT EXISTS credits_purchased INTEGER DEFAULT 0;

-- Create index for transaction_id lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id 
  ON public.payment_transactions(transaction_id);

-- Add plan_type column to user_profiles if missing
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- Update RLS policies for payment_transactions to allow users to insert their own transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.payment_transactions;
CREATE POLICY "Users can insert own transactions" ON public.payment_transactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions" ON public.payment_transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Ensure payment_gateways is readable by authenticated users (to fetch config for payments)
DROP POLICY IF EXISTS "Authenticated users can read enabled gateways" ON public.payment_gateways;
CREATE POLICY "Authenticated users can read enabled gateways" ON public.payment_gateways
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_enabled = true);

-- Admin full access to payment_gateways
DROP POLICY IF EXISTS "Admins have full access to payment_gateways" ON public.payment_gateways;
CREATE POLICY "Admins have full access to payment_gateways" ON public.payment_gateways
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- Admin full access to payment_transactions
DROP POLICY IF EXISTS "Admins have full access to payment_transactions" ON public.payment_transactions;
CREATE POLICY "Admins have full access to payment_transactions" ON public.payment_transactions
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- Enable RLS on these tables if not already enabled
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
