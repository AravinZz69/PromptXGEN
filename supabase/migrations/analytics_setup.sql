-- =============================================
-- ANALYTICS DATA SETUP - Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CREATE ANALYTICS EVENTS TABLE (for tracking)
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

-- =============================================
-- 2. CREATE USER ACTIVITY VIEW (for cohort analysis)
-- =============================================
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

-- =============================================
-- 3. CREATE DAILY STATS VIEW
-- =============================================
CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
  date_trunc('day', created_at)::date as date,
  COUNT(*) as prompts,
  COUNT(DISTINCT user_id) as unique_users
FROM prompt_history
WHERE created_at >= NOW() - interval '30 days'
GROUP BY date_trunc('day', created_at)::date
ORDER BY date;

-- =============================================
-- 4. CREATE MODEL USAGE STATS VIEW
-- =============================================
CREATE OR REPLACE VIEW category_analytics AS
SELECT 
  COALESCE(model, 'Other') as category,
  COUNT(*) as usage_count,
  ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM prompt_history), 0) * 100, 1) as percentage
FROM prompt_history
GROUP BY COALESCE(model, 'Other')
ORDER BY usage_count DESC;

-- =============================================
-- 5. SEED SAMPLE ANALYTICS EVENTS
-- =============================================
INSERT INTO analytics_events (user_id, event_type, event_data, country, created_at)
SELECT 
  p.id,
  'page_view',
  '{"page": "/dashboard"}'::jsonb,
  (ARRAY['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Australia'])[floor(random() * 6 + 1)],
  NOW() - (random() * interval '30 days')
FROM profiles p
CROSS JOIN generate_series(1, 5)
WHERE p.id IS NOT NULL;

INSERT INTO analytics_events (user_id, event_type, event_data, country, created_at)
SELECT 
  p.id,
  'prompt_generated',
  '{"model": "GPT-4o"}'::jsonb,
  (ARRAY['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Australia'])[floor(random() * 6 + 1)],
  NOW() - (random() * interval '14 days')
FROM profiles p
CROSS JOIN generate_series(1, 3)
WHERE p.id IS NOT NULL;

-- =============================================
-- 6. UPDATE PROMPT_TEMPLATES WITH USAGE STATS
-- =============================================
UPDATE prompt_templates 
SET times_used = floor(random() * 3000 + 500)::int
WHERE times_used = 0 OR times_used IS NULL;

-- =============================================
-- 7. ADD SOME PROMPTS IF NONE EXIST
-- =============================================
INSERT INTO prompt_history (user_id, input_text, output_text, model, created_at)
SELECT 
  p.id,
  'Sample input prompt ' || generate_series,
  'Sample generated output ' || generate_series,
  (ARRAY['groq', 'gpt-4o', 'claude-3.5-sonnet'])[floor(random() * 3 + 1)],
  NOW() - (generate_series * interval '1 day')
FROM profiles p
CROSS JOIN generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM prompt_history LIMIT 1);

-- =============================================
-- 8. VERIFY DATA
-- =============================================
SELECT 'analytics_events' as table_name, COUNT(*) as records FROM analytics_events
UNION ALL
SELECT 'prompt_history', COUNT(*) FROM prompt_history
UNION ALL
SELECT 'prompt_templates', COUNT(*) FROM prompt_templates;

-- Show country distribution
SELECT country, COUNT(*) as events 
FROM analytics_events 
WHERE country IS NOT NULL
GROUP BY country 
ORDER BY events DESC;
