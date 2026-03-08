-- ══════════════════════════════════════════════════════════════════════════════
-- Enable Realtime for Revenue Tables
-- This allows the admin Revenue Management page to receive instant updates
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable Realtime for subscriptions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;

-- Enable Realtime for payment_transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_transactions;

-- Enable Realtime for credit_transactions table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;

-- Ensure RLS is configured for these tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Admin can view all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role::text IN ('owner', 'admin')
    )
  );

-- Admin can update subscriptions
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update subscriptions" ON public.subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role::text IN ('owner', 'admin')
    )
  );

-- Admin can view all payment_transactions
DROP POLICY IF EXISTS "Admins can view all payment_transactions" ON public.payment_transactions;
CREATE POLICY "Admins can view all payment_transactions" ON public.payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role::text IN ('owner', 'admin')
    )
  );

-- Admin can view all credit_transactions
DROP POLICY IF EXISTS "Admins can view all credit_transactions" ON public.credit_transactions;
CREATE POLICY "Admins can view all credit_transactions" ON public.credit_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role::text IN ('owner', 'admin')
    )
  );

-- Create indexes for better performance on revenue queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(transaction_type);
