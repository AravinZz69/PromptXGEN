-- =============================================
-- ADMIN FEATURES V2 - Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. FIX SUPPORT_TICKETS TABLE - Add missing columns
-- =============================================
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]';

-- Disable RLS
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;
GRANT ALL ON support_tickets TO authenticated;

-- =============================================
-- 2. CREATE AUDIT_LOGS TABLE IF NOT EXISTS
-- =============================================
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

ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
GRANT ALL ON audit_logs TO authenticated;

-- =============================================
-- 3. CREATE/FIX PROMPT_TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Other',
  template_text TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS template_text TEXT DEFAULT '';
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0;

ALTER TABLE prompt_templates DISABLE ROW LEVEL SECURITY;
GRANT ALL ON prompt_templates TO authenticated;

-- =============================================
-- 4. ADD COLUMNS TO PROMPT_HISTORY IF MISSING
-- =============================================
ALTER TABLE prompt_history ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
ALTER TABLE prompt_history ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'GPT-4o';
ALTER TABLE prompt_history ADD COLUMN IF NOT EXISTS ai_response TEXT;
ALTER TABLE prompt_history ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
GRANT ALL ON prompt_history TO authenticated;

-- =============================================
-- 5. SEED SAMPLE AUDIT LOGS
-- =============================================
INSERT INTO audit_logs (user_email, action, description, ip_address, status, created_at)
SELECT 
  p.email,
  'login',
  'User logged in',
  '192.168.1.' || floor(random() * 255)::text,
  'success',
  NOW() - (random() * interval '7 days')
FROM profiles p
WHERE p.email IS NOT NULL
LIMIT 10;

INSERT INTO audit_logs (user_email, action, description, ip_address, status, created_at)
SELECT 
  p.email,
  'prompt_generated',
  'Generated a new prompt',
  '192.168.1.' || floor(random() * 255)::text,
  'success',
  NOW() - (random() * interval '5 days')
FROM profiles p
WHERE p.email IS NOT NULL
LIMIT 10;

INSERT INTO audit_logs (user_email, action, description, ip_address, status, created_at)
SELECT 
  p.email,
  'settings_updated',
  'Updated account settings',
  '192.168.1.' || floor(random() * 255)::text,
  'success',
  NOW() - (random() * interval '3 days')
FROM profiles p
WHERE p.email IS NOT NULL
LIMIT 5;

-- =============================================
-- 6. SEED SAMPLE SUPPORT TICKETS
-- =============================================
INSERT INTO support_tickets (user_id, user_email, subject, description, category, status, priority, messages, created_at)
SELECT 
  p.id,
  p.email,
  'Cannot generate prompts',
  'I keep getting an error when trying to generate prompts. Please help!',
  'Technical',
  'Open',
  'High',
  '[{"id": 1, "sender": "user", "text": "I keep getting an error when trying to generate prompts. Please help!", "timestamp": "2026-03-01T10:00:00Z"}]'::jsonb,
  NOW() - interval '3 days'
FROM profiles p
WHERE p.email IS NOT NULL
LIMIT 1;

INSERT INTO support_tickets (user_id, user_email, subject, description, category, status, priority, messages, created_at)
SELECT 
  p.id,
  p.email,
  'Billing question',
  'I was charged twice this month. Can you help me resolve this?',
  'Billing',
  'In Progress',
  'High',
  '[{"id": 1, "sender": "user", "text": "I was charged twice this month.", "timestamp": "2026-03-02T14:00:00Z"}]'::jsonb,
  NOW() - interval '2 days'
FROM profiles p
WHERE p.email IS NOT NULL
OFFSET 1 LIMIT 1;

INSERT INTO support_tickets (user_id, user_email, subject, description, category, status, priority, messages, created_at)
SELECT 
  p.id,
  p.email,
  'Feature request',
  'Would love to see more template categories for marketing content.',
  'Feature Request',
  'Open',
  'Low',
  '[{"id": 1, "sender": "user", "text": "Would love to see more template categories.", "timestamp": "2026-03-03T09:00:00Z"}]'::jsonb,
  NOW() - interval '1 day'
FROM profiles p
WHERE p.email IS NOT NULL
OFFSET 2 LIMIT 1;

-- =============================================
-- 7. SEED PROMPT TEMPLATES (only if empty)
-- =============================================
INSERT INTO prompt_templates (name, description, category, template_text, is_featured, times_used)
SELECT * FROM (VALUES 
  ('Code Review Assistant', 'Get detailed code review feedback', 'Coding', 'Review the following code...', true, 2847),
  ('Email Composer', 'Write professional emails', 'Business', 'Write a professional email...', true, 2156),
  ('Blog Post Writer', 'Generate engaging blog content', 'Creative Writing', 'Write a blog post about...', true, 1893),
  ('SEO Meta Generator', 'Create SEO-optimized meta tags', 'Marketing', 'Generate SEO meta...', false, 1654),
  ('API Documentation', 'Document API endpoints', 'Coding', 'Create documentation for...', false, 987)
) AS t(name, description, category, template_text, is_featured, times_used)
WHERE NOT EXISTS (SELECT 1 FROM prompt_templates LIMIT 1);

-- =============================================
-- 8. VERIFY
-- =============================================
SELECT 'audit_logs' as table_name, COUNT(*) as records FROM audit_logs
UNION ALL
SELECT 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL
SELECT 'prompt_templates', COUNT(*) FROM prompt_templates
UNION ALL
SELECT 'prompt_history', COUNT(*) FROM prompt_history;
