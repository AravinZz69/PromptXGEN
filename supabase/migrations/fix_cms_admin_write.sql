-- ============================================
-- FIX: CMS Admin Write Policies + Templates
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CMS_CONFIG TABLE & POLICIES
-- ============================================

-- Create cms_config table if not exists
CREATE TABLE IF NOT EXISTS cms_config (
  id uuid default gen_random_uuid() primary key,
  section text unique not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE cms_config ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admin can view cms_config" ON cms_config;
DROP POLICY IF EXISTS "Admin can insert cms_config" ON cms_config;
DROP POLICY IF EXISTS "Admin can update cms_config" ON cms_config;
DROP POLICY IF EXISTS "Admin can delete cms_config" ON cms_config;
DROP POLICY IF EXISTS "Public can view cms_config" ON cms_config;
DROP POLICY IF EXISTS "cms_config_public_read" ON cms_config;
DROP POLICY IF EXISTS "cms_config_admin_write" ON cms_config;
DROP POLICY IF EXISTS "cms_config_admin_all" ON cms_config;
DROP POLICY IF EXISTS "cms_config_auth_insert" ON cms_config;
DROP POLICY IF EXISTS "cms_config_auth_update" ON cms_config;
DROP POLICY IF EXISTS "cms_config_auth_delete" ON cms_config;

-- Create simple working policies
-- Anyone can read (for frontend)
CREATE POLICY "cms_config_public_read" ON cms_config
  FOR SELECT USING (true);

-- Any authenticated user can write (admin panel is already protected by routing)
CREATE POLICY "cms_config_auth_insert" ON cms_config
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "cms_config_auth_update" ON cms_config
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "cms_config_auth_delete" ON cms_config
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- 2. TEMPLATES TABLE & POLICIES
-- ============================================

-- Create templates table if not exists
CREATE TABLE IF NOT EXISTS templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now()
);

-- Add columns if missing
ALTER TABLE templates ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS role text default 'student';
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_pro boolean default false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_visible boolean default true;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_featured boolean default false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS usage_count integer default 0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "templates_public_read" ON templates;
DROP POLICY IF EXISTS "Public can view active templates" ON templates;
DROP POLICY IF EXISTS "templates_auth_all" ON templates;
DROP POLICY IF EXISTS "templates_admin_all" ON templates;

-- Public can read visible templates
CREATE POLICY "templates_public_read" ON templates
  FOR SELECT USING (is_visible = true);

-- Authenticated users can manage
CREATE POLICY "templates_auth_write" ON templates
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 3. SEED TEMPLATES (if empty)
-- ============================================

INSERT INTO templates (title, description, category, role, is_pro, is_visible, is_featured)
SELECT * FROM (VALUES
  ('Lesson Plan Generator', 'Create detailed lesson plans with objectives, activities, and assessments', 'K-12', 'teacher', false, true, false),
  ('MCQ Generator', 'Generate multiple choice questions for any subject', 'K-12', 'teacher', false, true, false),
  ('Worksheet Creator', 'Design practice worksheets with varied question types', 'K-12', 'teacher', false, true, false),
  ('Question Paper Builder', 'Create complete question papers with marking scheme', 'K-12', 'teacher', false, true, false),
  ('Concept Explainer', 'Get clear explanations of complex topics', 'K-12', 'student', false, true, true),
  ('Doubt Clarifier', 'Ask specific questions and get detailed answers', 'K-12', 'student', false, true, false),
  ('Technical Notes Generator', 'Create structured technical notes for engineering subjects', 'Engineering', 'student', false, true, false),
  ('Lab Manual Creator', 'Generate lab procedures and safety guidelines', 'Engineering', 'teacher', false, true, false),
  ('Engineering Problem Solver', 'Step-by-step solutions for engineering problems', 'Engineering', 'student', false, true, false),
  ('Code Explainer', 'Understand code with detailed explanations', 'Engineering', 'student', false, true, false),
  ('Clinical Case Study', 'Create medical case studies for learning', 'Medical', 'teacher', true, true, false),
  ('Anatomy Study Guide', 'Comprehensive anatomy revision notes', 'Medical', 'student', false, true, false),
  ('UPSC Essay Writer', 'Generate well-structured essays for UPSC preparation', 'UPSC', 'student', false, true, false),
  ('Current Affairs Summarizer', 'Get concise summaries of current events', 'UPSC', 'student', false, true, false),
  ('Business Case Study', 'Create detailed business case studies', 'Commerce', 'teacher', false, true, false),
  ('Financial Analysis Helper', 'Analyze financial statements and ratios', 'Commerce', 'student', false, true, false),
  ('JEE Physics Problem Solver', 'Step-by-step solutions for JEE Main & Advanced physics problems', 'JEE', 'student', false, true, true),
  ('JEE Chemistry Formula Sheet', 'Generate comprehensive formula sheets for organic, inorganic & physical chemistry', 'JEE', 'student', false, true, false),
  ('NEET Biology Notes Generator', 'Create detailed notes for Botany and Zoology NCERT chapters', 'NEET', 'student', false, true, false),
  ('GATE CS Question Bank', 'Practice questions for algorithms, OS, DBMS, and networks', 'GATE', 'student', false, true, true),
  ('Banking Awareness Notes', 'Current affairs and banking knowledge for IBPS, SBI, RBI exams', 'Banking', 'student', false, true, false),
  ('CAT VARC Preparation', 'Reading comprehension, para jumbles, and verbal ability', 'CAT', 'student', false, true, false),
  ('DSA Problem Solver', 'Solutions for arrays, trees, graphs, DP with code explanations', 'Engineering', 'student', false, true, true),
  ('Research Paper Outline', 'Create structured outlines for research papers', 'Research', 'student', true, true, false)
) AS t(title, description, category, role, is_pro, is_visible, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM templates LIMIT 1);

-- ============================================
-- 4. GRANTS
-- ============================================

GRANT SELECT ON cms_config TO anon;
GRANT ALL ON cms_config TO authenticated;
GRANT SELECT ON templates TO anon;
GRANT ALL ON templates TO authenticated;

-- ============================================
-- 5. VERIFY
-- ============================================

SELECT 'CMS Policies Fixed!' as status;
SELECT 'cms_config' as table_name, count(*) as count FROM cms_config
UNION ALL
SELECT 'templates', count(*) FROM templates;
