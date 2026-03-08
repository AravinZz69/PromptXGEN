-- ======================================================
-- PUBLIC CMS READ POLICIES
-- Allow anonymous users to read CMS config for landing page
-- Safe to run even if some tables don't exist yet
-- ======================================================

DO $$
BEGIN
  -- CMS CONFIG policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_config' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Admin can view cms_config" ON cms_config;
    DROP POLICY IF EXISTS "Public can view cms_config" ON cms_config;
    
    CREATE POLICY "Public can view cms_config"
      ON cms_config FOR SELECT
      USING (true);
    RAISE NOTICE 'Created policy for cms_config';
  END IF;

  -- BLOGS policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blogs' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Public can view published blogs" ON blogs;
    DROP POLICY IF EXISTS "blogs_public_read" ON blogs;
    
    CREATE POLICY "blogs_public_read" ON blogs
      FOR SELECT
      USING (is_published = true);
    RAISE NOTICE 'Created policy for blogs';
  END IF;

  -- TEAM MEMBERS policies
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_members' AND column_name = 'is_active' AND table_schema = 'public'
  ) THEN
    DROP POLICY IF EXISTS "Public can view active team members" ON team_members;
    DROP POLICY IF EXISTS "team_members_public_read" ON team_members;
    
    CREATE POLICY "team_members_public_read" ON team_members
      FOR SELECT
      USING (is_active = true);
    RAISE NOTICE 'Created policy for team_members';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members' AND table_schema = 'public') THEN
    -- Table exists but no is_active column - allow all reads
    DROP POLICY IF EXISTS "team_members_public_read" ON team_members;
    CREATE POLICY "team_members_public_read" ON team_members FOR SELECT USING (true);
    RAISE NOTICE 'Created permissive policy for team_members (no is_active column)';
  END IF;

  -- COMPANY VALUES policies
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_values' AND column_name = 'is_active' AND table_schema = 'public'
  ) THEN
    DROP POLICY IF EXISTS "Public can view active company values" ON company_values;
    DROP POLICY IF EXISTS "company_values_public_read" ON company_values;
    
    CREATE POLICY "company_values_public_read" ON company_values
      FOR SELECT
      USING (is_active = true);
    RAISE NOTICE 'Created policy for company_values';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_values' AND table_schema = 'public') THEN
    -- Table exists but no is_active column - allow all reads
    DROP POLICY IF EXISTS "company_values_public_read" ON company_values;
    CREATE POLICY "company_values_public_read" ON company_values FOR SELECT USING (true);
    RAISE NOTICE 'Created permissive policy for company_values (no is_active column)';
  END IF;

  -- TEMPLATES policies (uses is_visible, not is_active)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'templates' AND column_name = 'is_visible' AND table_schema = 'public'
  ) THEN
    DROP POLICY IF EXISTS "Public can view active templates" ON templates;
    DROP POLICY IF EXISTS "templates_public_read" ON templates;
    
    CREATE POLICY "templates_public_read" ON templates
      FOR SELECT
      USING (is_visible = true);
    RAISE NOTICE 'Created policy for templates';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates' AND table_schema = 'public') THEN
    -- Table exists but no is_visible column - allow all reads
    DROP POLICY IF EXISTS "templates_public_read" ON templates;
    CREATE POLICY "templates_public_read" ON templates FOR SELECT USING (true);
    RAISE NOTICE 'Created permissive policy for templates (no is_visible column)';
  END IF;

  RAISE NOTICE 'Public CMS read policies created successfully';
END $$;
