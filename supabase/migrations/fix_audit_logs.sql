-- =============================================
-- FIX AUDIT LOGS - Run this in Supabase SQL Editor
-- =============================================

-- Ensure audit_logs table exists
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for admin access
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON audit_logs TO anon;

-- Create RPC function to get all audit logs (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_audit_logs()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  action TEXT,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  status TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.user_email,
    al.action,
    al.description,
    al.ip_address,
    al.user_agent,
    al.metadata,
    al.status,
    al.created_at
  FROM audit_logs al
  ORDER BY al.created_at DESC
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_all_audit_logs() TO authenticated;

-- Delete old sample data and add fresh audit logs
DELETE FROM audit_logs WHERE description LIKE '%Sample%' OR description LIKE '%System%';

-- Seed audit logs with realistic data
INSERT INTO audit_logs (user_email, action, description, ip_address, user_agent, status, metadata, created_at)
VALUES
  ('admin@promptxgen.com', 'login', 'Admin user logged in', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'success', '{"method": "email"}', NOW() - interval '10 minutes'),
  ('user1@example.com', 'user_created', 'New user account created', '10.0.0.15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 'success', '{"plan": "free"}', NOW() - interval '1 hour'),
  ('user2@example.com', 'prompt_generated', 'User generated a prompt', '172.16.0.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0', 'success', '{"model": "groq", "tokens": 450}', NOW() - interval '2 hours'),
  ('admin@promptxgen.com', 'settings_updated', 'Admin updated system settings', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'success', '{"setting": "maintenance_mode", "value": false}', NOW() - interval '3 hours'),
  ('user3@example.com', 'subscription_changed', 'User upgraded to Pro plan', '10.0.0.45', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) Safari/604.1', 'success', '{"from": "free", "to": "pro"}', NOW() - interval '5 hours'),
  ('user4@example.com', 'payment_processed', 'Payment successfully processed', '192.168.10.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0', 'success', '{"amount": 29.99, "currency": "USD"}', NOW() - interval '6 hours'),
  ('user5@example.com', 'login', 'User logged in', '10.20.30.40', 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0.6099.43 Mobile', 'success', '{"method": "google"}', NOW() - interval '8 hours'),
  ('user6@example.com', 'payment_failed', 'Payment declined by bank', '172.20.0.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'failed', '{"reason": "insufficient_funds", "amount": 99.99}', NOW() - interval '12 hours'),
  ('admin@promptxgen.com', 'admin_action', 'Admin granted credits to user', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'success', '{"target_user": "user7@example.com", "credits": 100}', NOW() - interval '1 day'),
  ('user7@example.com', 'prompt_generated', 'User generated marketing prompt', '10.10.10.10', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0', 'success', '{"model": "gpt-4o", "category": "marketing"}', NOW() - interval '1 day 2 hours'),
  ('user8@example.com', 'user_updated', 'User updated profile information', '192.168.5.55', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0', 'success', '{"fields": ["full_name", "avatar"]}', NOW() - interval '1 day 5 hours'),
  ('admin@promptxgen.com', 'api_key_rotated', 'API key was rotated', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'success', '{"service": "groq"}', NOW() - interval '2 days'),
  ('user9@example.com', 'logout', 'User logged out', '10.0.0.99', 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) Safari/605.1.15', 'success', '{}', NOW() - interval '2 days 3 hours'),
  ('user10@example.com', 'login', 'Failed login attempt', '203.0.113.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0', 'failed', '{"reason": "invalid_password", "attempts": 3}', NOW() - interval '3 days'),
  ('admin@promptxgen.com', 'user_deleted', 'Admin deleted inactive user account', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'success', '{"deleted_user": "inactive@old.com", "reason": "user_request"}', NOW() - interval '4 days'),
  ('user11@example.com', 'subscription_changed', 'User downgraded to Free plan', '10.50.50.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 'success', '{"from": "pro", "to": "free"}', NOW() - interval '5 days'),
  ('system@promptxgen.com', 'settings_updated', 'Automatic maintenance completed', NULL, 'System', 'success', '{"task": "cleanup_old_sessions"}', NOW() - interval '6 days'),
  ('user12@example.com', 'prompt_generated', 'User generated coding prompt', '172.16.100.100', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0', 'success', '{"model": "claude-3.5-sonnet", "category": "coding"}', NOW() - interval '6 days 12 hours');

-- Verify data
SELECT 'Audit logs count:' as info, COUNT(*) as count FROM audit_logs;
SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC;

SELECT '✅ Audit logs fixed and seeded!' as status;
