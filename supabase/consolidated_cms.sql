-- =============================================
-- CONSOLIDATED CMS MIGRATIONS
-- =============================================
-- This file contains all CMS-related tables, functions, and policies
-- Includes: cms_config, blog_posts, blogs, team_members, company_values, templates
-- =============================================
-- Run this in Supabase SQL Editor
-- =============================================



-- =============================================
-- SECTION 1: CMS CONFIG TABLE
-- =============================================
-- Stores JSON config for all CMS sections (theme, hero, features, pricing, faq, team, navbar, footer)

CREATE TABLE IF NOT EXISTS public.cms_config (
  id uuid default gen_random_uuid() primary key,
  section text unique not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cms_config_section ON cms_config(section);

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cms_config_updated_at ON cms_config;
CREATE TRIGGER cms_config_updated_at
  BEFORE UPDATE ON cms_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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



-- =============================================
-- SECTION 2: BLOG POSTS TABLE
-- =============================================
-- Stores all blog posts with full metadata

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  category text default 'General',
  author text,
  cover_image_url text,
  tags text[] default '{}',
  status text default 'draft' check (status in ('draft', 'published')),
  content text,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at desc);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can insert blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can update blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can delete blog_posts" ON blog_posts;

-- Blog Post Policies
CREATE POLICY "Admin can view blog_posts" ON blog_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert blog_posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update blog_posts" ON blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete blog_posts" ON blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  if new.status = 'published' and old.status != 'published' then
    new.published_at = now();
  end if;
  return new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_set_published_at ON blog_posts;
CREATE TRIGGER blog_posts_set_published_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();



-- =============================================
-- SECTION 3: BLOGS TABLE (ALTERNATIVE)
-- =============================================
-- Alternative blogs table with more fields

CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  category text,
  tags text[] default '{}',
  author_name text,
  author_role text,
  author_avatar text,
  cover_image text,
  read_time text,
  published_at date,
  is_featured boolean default false,
  is_published boolean default true,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "blogs_admin_all" ON blogs;
DROP POLICY IF EXISTS "blogs_public_read" ON blogs;

-- Blogs policies
CREATE POLICY "blogs_admin_all" ON blogs
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "blogs_public_read" ON blogs
  FOR SELECT USING (is_published = true);



-- =============================================
-- SECTION 4: TEAM MEMBERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  bio text,
  avatar text,
  social_twitter text,
  social_linkedin text,
  social_github text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "team_members_admin_all" ON team_members;
DROP POLICY IF EXISTS "team_members_public_read" ON team_members;

-- Team members policies
CREATE POLICY "team_members_admin_all" ON team_members
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "team_members_public_read" ON team_members
  FOR SELECT USING (is_active = true);



-- =============================================
-- SECTION 5: COMPANY VALUES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.company_values (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  icon text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

ALTER TABLE company_values ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "company_values_admin_all" ON company_values;
DROP POLICY IF EXISTS "company_values_public_read" ON company_values;

-- Company values policies
CREATE POLICY "company_values_admin_all" ON company_values
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "company_values_public_read" ON company_values
  FOR SELECT USING (is_active = true);



-- =============================================
-- SECTION 6: TEMPLATES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text,
  description text,
  category text,
  role text default 'student',
  is_pro boolean default false,
  is_visible boolean default true,
  is_featured boolean default false,
  usage_count integer default 0,
  updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "templates_public_read" ON templates;
DROP POLICY IF EXISTS "templates_auth_write" ON templates;

-- Public can read visible templates
CREATE POLICY "templates_public_read" ON templates
  FOR SELECT USING (is_visible = true);

-- Authenticated users can manage
CREATE POLICY "templates_auth_write" ON templates
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);



-- =============================================
-- SECTION 7: ANALYTICS EVENTS TABLE
-- =============================================

DROP TABLE IF EXISTS public.analytics_events CASCADE;

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
GRANT ALL ON analytics_events TO authenticated;

-- Analytics Views
CREATE OR REPLACE VIEW user_cohort_analysis AS
SELECT 
  date_trunc('week', p.created_at) as cohort_week,
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN ph.created_at IS NOT NULL THEN p.id END) as active_users,
  COALESCE(SUM(uc.credits_balance), 0) as total_credits
FROM profiles p
LEFT JOIN prompt_history ph ON p.id = ph.user_id 
  AND ph.created_at >= p.created_at 
  AND ph.created_at < p.created_at + interval '30 days'
LEFT JOIN user_credits uc ON p.id = uc.user_id
GROUP BY date_trunc('week', p.created_at)
ORDER BY cohort_week DESC;

CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
  date_trunc('day', created_at)::date as date,
  COUNT(*) as prompts,
  COUNT(DISTINCT user_id) as unique_users
FROM prompt_history
WHERE created_at >= NOW() - interval '30 days'
GROUP BY date_trunc('day', created_at)::date
ORDER BY date;

CREATE OR REPLACE VIEW category_analytics AS
SELECT 
  COALESCE(model, 'Other') as category,
  COUNT(*) as usage_count,
  ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM prompt_history), 0) * 100, 1) as percentage
FROM prompt_history
GROUP BY COALESCE(model, 'Other')
ORDER BY usage_count DESC;



-- =============================================
-- SECTION 8: STORAGE BUCKET
-- =============================================
-- Create storage bucket for CMS media (if not exists)

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admin can upload to cms-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update cms-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete from cms-media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cms-media" ON storage.objects;

-- Storage policies for cms-media bucket
CREATE POLICY "Admin can upload to cms-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cms-media' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can update cms-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cms-media' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete from cms-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cms-media' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view cms-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-media');



-- =============================================
-- SECTION 9: ENABLE REALTIME
-- =============================================
-- Enable realtime on cms_config table for live theme updates

ALTER PUBLICATION supabase_realtime ADD TABLE cms_config;



-- =============================================
-- SECTION 10: SEED DATA
-- =============================================

-- Seed navbar with defaults
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'navbar',
  '{
    "logoUrl": "",
    "siteName": "AskJai",
    "tagline": "AI Prompt Generator",
    "navLinks": [
      {"id": "1", "label": "Features", "url": "#features", "isExternal": false, "isVisible": true},
      {"id": "2", "label": "Pricing", "url": "#pricing", "isExternal": false, "isVisible": true},
      {"id": "3", "label": "Templates", "url": "/templates", "isExternal": false, "isVisible": true},
      {"id": "4", "label": "Blogs", "url": "/blogs", "isExternal": false, "isVisible": true},
      {"id": "5", "label": "About", "url": "/about", "isExternal": false, "isVisible": true},
      {"id": "6", "label": "Contact", "url": "/contact", "isExternal": false, "isVisible": true}
    ],
    "ctaText": "Dashboard",
    "ctaUrl": "/dashboard",
    "ctaVisible": true,
    "ctaStyle": "primary",
    "stickyNavbar": true,
    "transparentOnHero": true
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO NOTHING;

-- Seed footer with defaults
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'footer',
  '{
    "footerLogoUrl": "",
    "footerTagline": "AI prompt engineering, simplified.",
    "social": {
      "twitter": {"url": "", "visible": false},
      "linkedin": {"url": "", "visible": false},
      "github": {"url": "", "visible": false},
      "instagram": {"url": "", "visible": false},
      "youtube": {"url": "", "visible": false}
    },
    "columns": [
      {"id": "1", "title": "Product", "links": [
        {"id": "1-1", "label": "Features", "url": "#features"},
        {"id": "1-2", "label": "Pricing", "url": "#pricing"},
        {"id": "1-3", "label": "Templates", "url": "#templates"}
      ]},
      {"id": "2", "title": "Company", "links": [
        {"id": "2-1", "label": "About", "url": "/about"},
        {"id": "2-2", "label": "Blog", "url": "/blogs"},
        {"id": "2-3", "label": "Contact", "url": "/contact"}
      ]},
      {"id": "3", "title": "Legal", "links": [
        {"id": "3-1", "label": "Privacy", "url": "/terms?tab=privacy"},
        {"id": "3-2", "label": "Terms", "url": "/terms"}
      ]}
    ],
    "copyrightText": "© 2026 AskJai. All rights reserved.",
    "showNewsletter": false,
    "newsletterPlaceholder": "Enter your email"
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO NOTHING;

-- Seed hero with defaults
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'hero',
  '{
    "badge": "✨ AI-Powered Prompt Engineering",
    "headline": "Generate Perfect Prompts in Seconds",
    "subHeadline": "Transform your ideas into powerful AI prompts with our intelligent generator. Get better results from ChatGPT, Claude, and other AI models.",
    "cta1Label": "Start Generating",
    "cta1Url": "/prompt-generator",
    "cta2Label": "View Templates",
    "cta2Url": "#templates"
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO NOTHING;

-- Seed theme with defaults
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'theme',
  '{
    "activeTheme": "cosmos",
    "customizations": {
      "cosmos": {},
      "aurora": {},
      "lumina": {}
    }
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Seed active_theme
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'active_theme',
  '{"theme": "cosmos"}'::jsonb,
  NOW()
)
ON CONFLICT (section) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Seed team members
INSERT INTO team_members (name, role, bio, avatar, social_linkedin, social_github, display_order)
VALUES 
  ('Deekshitha', 'Full Stack Developer', 'Talented full-stack developer with expertise in React, Node.js, and cloud technologies. Builds scalable web applications from frontend to backend with modern best practices.', 'https://api.dicebear.com/7.x/initials/svg?seed=Deekshitha&backgroundColor=8b5cf6', 'https://www.linkedin.com/in/deekshitha-bonthu-48878a321', 'https://github.com/deekshu15', 1),
  ('Arvind Kumar', 'Backend Developer', 'Backend specialist with deep expertise in Python, PostgreSQL, and microservices architecture. Designs robust APIs and database systems that power AI applications.', 'https://api.dicebear.com/7.x/initials/svg?seed=ArvindKumar&backgroundColor=6366f1', 'https://www.linkedin.com/in/arvind-kumar-79676031b', 'https://github.com/AravinZz69', 2),
  ('Anuradha', 'AI/ML Engineer', 'Machine learning engineer specializing in NLP and generative AI. Develops and fine-tunes AI models for intelligent prompt optimization and content generation.', 'https://api.dicebear.com/7.x/initials/svg?seed=Anuradha&backgroundColor=ec4899', 'https://www.linkedin.com/in/anuradha-gorle-675b0631b/', 'https://github.com/anu577', 3),
  ('Pujith Sai', 'Frontend Developer', 'Creative frontend developer skilled in React, TypeScript, and UI/UX design. Crafts beautiful, responsive interfaces that deliver exceptional user experiences.', 'https://api.dicebear.com/7.x/initials/svg?seed=PujithSai&backgroundColor=10b981', 'https://www.linkedin.com/in/pujith-sai-cheeday-58078a321/', 'https://github.com/Pujithcheeday', 4)
ON CONFLICT DO NOTHING;

-- Seed company values
INSERT INTO company_values (title, description, icon, display_order)
VALUES 
  ('Innovation First', 'We push the boundaries of what''s possible with AI, constantly exploring new techniques and approaches to prompt optimization.', 'Lightbulb', 1),
  ('User Obsession', 'Every decision starts with the user. We build tools that solve real problems and make AI genuinely accessible.', 'Heart', 2),
  ('Radical Transparency', 'We share our roadmap, our challenges, and our learnings openly. Trust is built through honesty.', 'Eye', 3),
  ('Quality Over Speed', 'We''d rather ship something great next week than something mediocre today. Excellence is non-negotiable.', 'Trophy', 4),
  ('Collaborative Spirit', 'The best ideas come from diverse perspectives. We foster an environment where everyone''s voice matters.', 'Users', 5)
ON CONFLICT DO NOTHING;

-- Seed templates
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



-- =============================================
-- GRANTS
-- =============================================
GRANT SELECT ON cms_config TO anon;
GRANT ALL ON cms_config TO authenticated;
GRANT SELECT ON templates TO anon;
GRANT ALL ON templates TO authenticated;
GRANT SELECT ON blogs TO anon;
GRANT ALL ON blogs TO authenticated;
GRANT SELECT ON team_members TO anon;
GRANT ALL ON team_members TO authenticated;
GRANT SELECT ON company_values TO anon;
GRANT ALL ON company_values TO authenticated;



-- =============================================
-- VERIFICATION
-- =============================================
SELECT '✅ CMS migrations complete!' as status;
SELECT 'cms_config' as table_name, COUNT(*) as count FROM cms_config
UNION ALL
SELECT 'templates', COUNT(*) FROM templates
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'company_values', COUNT(*) FROM company_values;
