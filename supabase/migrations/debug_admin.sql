-- =============================================
-- ADMIN DEBUG & FIX SCRIPT
-- =============================================
-- Run this to check and fix admin access issues
-- =============================================

-- 1. Check if is_admin function exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- 2. Check current user's auth.uid()
SELECT auth.uid() as current_user_id;

-- 3. Check admin_users table
SELECT * FROM admin_users;

-- 4. Check all users in profiles
SELECT id, email, full_name, plan, created_at FROM profiles ORDER BY created_at DESC LIMIT 20;

-- 5. Test is_admin function for current user
SELECT public.is_admin(auth.uid()) as is_current_user_admin;

-- =============================================
-- FIX: Add your user as owner if not already admin
-- Replace 'your-email@example.com' with your actual email
-- =============================================

-- Uncomment and run this to make yourself an admin:
-- INSERT INTO admin_users (user_id, role)
-- SELECT id, 'owner' FROM profiles WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'owner';

-- Or use your user ID directly:
-- INSERT INTO admin_users (user_id, role) VALUES ('your-user-uuid-here', 'owner')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'owner';

-- =============================================
-- ALTERNATIVE: Temporarily disable RLS for testing
-- (Use with caution - re-enable after testing!)
-- =============================================

-- To disable RLS temporarily (will allow all access):
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
