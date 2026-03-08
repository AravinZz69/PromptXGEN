-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Seed Default Theme Configuration
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Run this in your Supabase SQL Editor

-- 1. Insert default active theme (cosmos) - using object format
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'active_theme',
  '{"theme": "cosmos"}'::jsonb,
  NOW()
)
ON CONFLICT (section) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = NOW();

-- 2. Insert theme metadata (optional - for customizations)
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
ON CONFLICT (section) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = NOW();

-- Verify insertion
SELECT section, data, updated_at 
FROM cms_config 
WHERE section IN ('active_theme', 'theme');
