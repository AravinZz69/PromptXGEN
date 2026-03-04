-- =============================================
-- ADMIN FEATURES TABLES - Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Grant access
GRANT ALL ON audit_logs TO authenticated;
GRANT SELECT ON audit_logs TO anon;

-- =============================================
-- 2. SUPPORT TICKETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  assigned_to TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for admin access
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);

-- Grant access
GRANT ALL ON support_tickets TO authenticated;
GRANT SELECT ON support_tickets TO anon;

-- =============================================
-- 3. PROMPT TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Other',
  template_text TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for admin access
ALTER TABLE prompt_templates DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON prompt_templates TO authenticated;
GRANT SELECT ON prompt_templates TO anon;

-- =============================================
-- 4. ENSURE PROMPT_HISTORY HAS REQUIRED COLUMNS
-- =============================================
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_history' AND column_name = 'category') THEN
    ALTER TABLE prompt_history ADD COLUMN category TEXT DEFAULT 'Other';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_history' AND column_name = 'model') THEN
    ALTER TABLE prompt_history ADD COLUMN model TEXT DEFAULT 'GPT-4o';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_history' AND column_name = 'ai_response') THEN
    ALTER TABLE prompt_history ADD COLUMN ai_response TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_history' AND column_name = 'metadata') THEN
    ALTER TABLE prompt_history ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- Make sure prompt_history has RLS disabled
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
GRANT ALL ON prompt_history TO authenticated;

-- =============================================
-- 5. CREATE FUNCTION TO AUTO-LOG AUDIT EVENTS
-- =============================================
-- Drop existing functions first
DROP FUNCTION IF EXISTS log_audit_event(UUID, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS log_audit_event(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS log_audit_event(UUID, TEXT);
DROP FUNCTION IF EXISTS log_audit_event;

CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_email FROM profiles WHERE id = p_user_id;
  
  INSERT INTO audit_logs (user_id, user_email, action, description, metadata)
  VALUES (p_user_id, v_email, p_action, p_description, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_audit_event(UUID, TEXT, TEXT, JSONB) TO authenticated;

-- =============================================
-- 6. SEED SAMPLE DATA FOR TESTING
-- =============================================

-- Sample Audit Logs (using existing users)
INSERT INTO audit_logs (user_email, action, description, ip_address, status, created_at)
SELECT 
  p.email,
  action,
  description,
  '192.168.1.' || floor(random() * 255)::text,
  'success',
  NOW() - (random() * interval '7 days')
FROM profiles p
CROSS JOIN (
  VALUES 
    ('login', 'User logged in'),
    ('prompt_generated', 'Generated a new prompt'),
    ('settings_updated', 'Updated account settings')
) AS actions(action, description)
WHERE p.email IS NOT NULL
LIMIT 30;

-- Sample Support Tickets
-- First ensure description column exists
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS description TEXT;

INSERT INTO support_tickets (user_id, user_email, subject, description, category, status, priority, messages, created_at)
SELECT 
  p.id,
  p.email,
  subjects.subject,
  subjects.descr,
  subjects.category,
  subjects.status,
  subjects.priority,
  jsonb_build_array(jsonb_build_object(
    'id', 1,
    'sender', 'user',
    'text', subjects.descr,
    'timestamp', NOW()::text
  )),
  NOW() - (random() * interval '14 days')
FROM profiles p
CROSS JOIN (
  VALUES 
    ('Cannot generate prompts', 'I keep getting an error when trying to generate prompts. Please help!', 'Technical', 'Open', 'High'),
    ('Billing question', 'I was charged twice this month. Can you help me resolve this?', 'Billing', 'In Progress', 'High'),
    ('Feature request', 'Would love to see more template categories for marketing content.', 'Feature Request', 'Open', 'Low'),
    ('Account access issue', 'I cannot access my account settings page.', 'Account', 'Open', 'Medium')
) AS subjects(subject, descr, category, status, priority)
WHERE p.email IS NOT NULL
LIMIT 12;

-- Sample Prompt Templates
INSERT INTO prompt_templates (name, description, category, template_text, is_featured, times_used)
VALUES 
  ('Code Review Assistant', 'Get detailed code review feedback', 'Coding', 'Review the following code and provide feedback on:\n1. Code quality\n2. Potential bugs\n3. Performance improvements\n\nCode:\n{code}', true, 2847),
  ('Email Composer', 'Write professional emails', 'Business', 'Write a professional email for the following purpose:\n\nPurpose: {purpose}\nTone: {tone}\nKey points: {points}', true, 2156),
  ('Blog Post Writer', 'Generate engaging blog content', 'Creative Writing', 'Write a blog post about {topic} with the following requirements:\n- Length: {length} words\n- Audience: {audience}\n- Include: {include}', true, 1893),
  ('SEO Meta Generator', 'Create SEO-optimized meta tags', 'Marketing', 'Generate SEO meta title and description for:\n\nPage: {page}\nKeywords: {keywords}\nBrand: {brand}', false, 1654),
  ('API Documentation', 'Document API endpoints', 'Coding', 'Create documentation for the following API endpoint:\n\nMethod: {method}\nEndpoint: {endpoint}\nParameters: {params}', false, 987)
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. VERIFY SETUP
-- =============================================
SELECT 'Tables created successfully!' as status;

SELECT 'audit_logs' as table_name, COUNT(*) as records FROM audit_logs
UNION ALL
SELECT 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL
SELECT 'prompt_templates', COUNT(*) FROM prompt_templates
UNION ALL
SELECT 'prompt_history', COUNT(*) FROM prompt_history;
