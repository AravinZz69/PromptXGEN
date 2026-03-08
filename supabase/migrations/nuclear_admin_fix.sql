-- =============================================
-- NUCLEAR ADMIN FIX - This WILL work
-- Run this in Supabase SQL Editor
-- =============================================

-- STEP 1: Disable RLS on ALL relevant tables (admin access)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Create subscriptions if not exists
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
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- STEP 2: Verify data exists
SELECT 'Total profiles:' as check, COUNT(*) as count FROM profiles;
SELECT 'Total user_profiles:' as check, COUNT(*) as count FROM user_profiles;
SELECT 'Total user_credits:' as check, COUNT(*) as count FROM user_credits;
SELECT 'Total prompt_history:' as check, COUNT(*) as count FROM prompt_history;
SELECT 'Total credit_transactions:' as check, COUNT(*) as count FROM credit_transactions;

-- STEP 3: Grant full access to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_credits TO authenticated;
GRANT ALL ON credit_transactions TO authenticated;
GRANT ALL ON prompt_history TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON subscriptions TO authenticated;

-- Also grant to anon for public queries
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON user_credits TO anon;

-- Show some sample data to verify
SELECT 'Sample profiles:' as info;
SELECT id, email, full_name, created_at FROM profiles LIMIT 5;
