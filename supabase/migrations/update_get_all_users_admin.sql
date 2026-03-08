-- =============================================
-- UPDATE GET ALL USERS ADMIN FUNCTION
-- Adds mobile, city, role, use_case, experience_level
-- =============================================

-- Drop existing function
DROP FUNCTION IF EXISTS get_all_users_admin();

-- Create updated function with all user profile fields
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;
