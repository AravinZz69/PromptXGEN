-- ══════════════════════════════════════════════════════════════════════════════
-- AI Models & Feature Flags RLS and Realtime Enhancement
-- Ensure admins can manage AI models and enable realtime for both tables
-- ══════════════════════════════════════════════════════════════════════════════

-- Ensure RLS is enabled
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins have full access to ai_models" ON public.ai_models;
DROP POLICY IF EXISTS "Authenticated users can read enabled ai_models" ON public.ai_models;
DROP POLICY IF EXISTS "Admins have full access to feature_flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Authenticated users can read feature_flags" ON public.feature_flags;

-- AI Models Policies
-- Allow admins to do everything with ai_models
CREATE POLICY "Admins have full access to ai_models" ON public.ai_models
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role::text IN ('owner', 'admin')
    )
  );

-- Allow authenticated users to read enabled models (needed for chat/prompt generation)
CREATE POLICY "Authenticated users can read enabled ai_models" ON public.ai_models
  FOR SELECT
  USING (auth.role() = 'authenticated' AND enabled = true);

-- Feature Flags Policies
-- Allow admins to do everything with feature_flags
CREATE POLICY "Admins have full access to feature_flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role::text IN ('owner', 'admin')
    )
  );

-- Allow authenticated users to read feature_flags (needed for feature checks)
CREATE POLICY "Authenticated users can read feature_flags" ON public.feature_flags
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Enable Realtime for both tables
-- This allows the Supabase client to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_models;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_models_enabled ON public.ai_models(enabled);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_default ON public.ai_models(is_default);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
