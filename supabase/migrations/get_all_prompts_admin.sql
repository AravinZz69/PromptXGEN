-- =============================================
-- GET ALL PROMPTS FOR ADMIN
-- Run this in Supabase SQL Editor
-- =============================================

-- Disable RLS on prompt_history for admin access
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_all_prompts_admin();

-- Create function to get all prompts with user info (admin only)
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_all_prompts_admin() TO authenticated;
GRANT ALL ON prompt_history TO authenticated;

-- Verify function exists
SELECT 'Function created:' as info;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'get_all_prompts_admin';

-- Show sample data
SELECT 'Sample prompt history:' as info;
SELECT id, user_id, prompt_type, model, created_at FROM prompt_history LIMIT 5;

SELECT '✅ Admin prompt viewing function created!' as status;
