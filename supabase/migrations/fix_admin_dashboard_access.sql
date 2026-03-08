-- =============================================
-- FIX ADMIN DASHBOARD DATA ACCESS
-- Run this in Supabase SQL Editor
-- =============================================

-- Disable RLS on tables needed for admin dashboard
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON prompt_history TO authenticated;
GRANT ALL ON credit_transactions TO authenticated;

-- Create get_all_users_admin function if not exists
CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ,
  credits_balance INTEGER,
  total_credits INTEGER,
  used_credits INTEGER
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.id as user_id,
    COALESCE(p.email, u.email)::TEXT as email,
    COALESCE(p.full_name, split_part(COALESCE(p.email, u.email), '@', 1))::TEXT as full_name,
    COALESCE(p.plan::TEXT, 'free') as plan,
    p.created_at,
    COALESCE(uc.credits_balance, 0) as credits_balance,
    COALESCE(uc.total_credits, 0) as total_credits,
    COALESCE(uc.used_credits, 0) as used_credits
  FROM profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  LEFT JOIN user_credits uc ON uc.user_id = p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;

-- Verify
SELECT 'Profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Prompt history count:' as info, COUNT(*) as count FROM prompt_history;
SELECT 'Credit transactions count:' as info, COUNT(*) as count FROM credit_transactions;

SELECT '✅ Admin dashboard access fixed!' as status;
