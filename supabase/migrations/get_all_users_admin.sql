-- =============================================
-- GET ALL USERS FOR ADMIN - Run in Supabase SQL Editor
-- This function bypasses RLS to fetch all users
-- =============================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_all_users_admin();

-- Create function to get all users (admin only)
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
  updated_at TIMESTAMPTZ
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
    COALESCE(p.updated_at, u.created_at) as updated_at
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  LEFT JOIN user_credits c ON c.user_id = u.id
  LEFT JOIN user_profiles up ON up.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;

-- Also backfill missing profiles for any existing auth.users
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

-- Verify the data
SELECT 'Auth users count:' as info, COUNT(*) as count FROM auth.users;
SELECT 'Profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'User credits count:' as info, COUNT(*) as count FROM user_credits;
SELECT 'Admin users:' as info, user_id, role FROM admin_users;

-- Test the function (will only work if you're logged in as admin)
-- SELECT * FROM get_all_users_admin();

SELECT '✅ Admin user fetch function created!' as status;
