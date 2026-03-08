-- ============================================
-- Enable Realtime for CMS Config
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable realtime on cms_config table for live theme updates
ALTER PUBLICATION supabase_realtime ADD TABLE cms_config;

-- Verify
SELECT 'Realtime enabled for cms_config!' as status;
