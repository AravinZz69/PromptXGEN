-- =============================================
-- ADMIN PORTAL ADDITIONAL TABLES
-- =============================================
-- Run this after schema.sql to add admin portal tables
-- =============================================

-- =============================================
-- 1. SUPPORT TICKETS
-- =============================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  assignee TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. AUDIT LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  request_id TEXT,
  status TEXT DEFAULT 'success',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. FEATURE FLAGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  section TEXT DEFAULT 'Core Features',
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  enabled_for_plans TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. NOTIFICATIONS (Admin sent notifications)
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'free', 'pro', 'enterprise')),
  channels TEXT[] DEFAULT '{"email"}',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Sent')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. SUBSCRIPTIONS (User billing)
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Cancelled', 'Past Due', 'Trialing')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  next_billing_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. PROMPT TEMPLATES (System templates)
-- =============================================
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. AI MODEL CONFIG
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  available_for_plans TEXT[] DEFAULT '{"free", "pro", "enterprise"}',
  input_cost_per_million DECIMAL(10,4) DEFAULT 0,
  output_cost_per_million DECIMAL(10,4) DEFAULT 0,
  max_tokens INTEGER DEFAULT 4096,
  api_key_encrypted TEXT,
  tokens_used BIGINT DEFAULT 0,
  requests_today INTEGER DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON public.admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- =============================================
-- 9. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies (admin_users table check)
CREATE POLICY "Admins can view support_tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view audit_logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Allow audit log insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage feature_flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can read feature_flags" ON public.feature_flags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage notifications" ON public.admin_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can read templates" ON public.prompt_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON public.prompt_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can read ai_models" ON public.ai_models
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage ai_models" ON public.ai_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- =============================================
-- 10. TRIGGERS FOR updated_at
-- =============================================
CREATE TRIGGER update_support_tickets_updated_at 
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_feature_flags_updated_at 
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_notifications_updated_at 
  BEFORE UPDATE ON public.admin_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prompt_templates_updated_at 
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_models_updated_at 
  BEFORE UPDATE ON public.ai_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 11. HELPER FUNCTIONS
-- =============================================

-- Get admin dashboard stats (extended)
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats_v2()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users', (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true),
    'total_admins', (SELECT COUNT(*) FROM public.admin_users WHERE role = 'admin'),
    'total_owners', (SELECT COUNT(*) FROM public.admin_users WHERE role = 'owner'),
    'total_prompts', (SELECT COUNT(*) FROM public.prompt_history),
    'prompts_today', (SELECT COUNT(*) FROM public.prompt_history WHERE created_at >= CURRENT_DATE),
    'total_credits_used', (SELECT COALESCE(SUM(amount), 0) FROM public.credit_transactions WHERE transaction_type = 'deduction'),
    'new_users_today', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE),
    'new_users_week', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'Active'),
    'mrr', (SELECT COALESCE(SUM(amount), 0) FROM public.subscriptions WHERE status = 'Active'),
    'open_tickets', (SELECT COUNT(*) FROM public.support_tickets WHERE status IN ('Open', 'In Progress'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get prompts stats by day (last 30 days)
CREATE OR REPLACE FUNCTION get_prompts_by_day(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as count
  FROM public.prompt_history
  WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get signups by week (last 8 weeks)
CREATE OR REPLACE FUNCTION get_signups_by_week(weeks_back INTEGER DEFAULT 8)
RETURNS TABLE (
  week_start DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('week', created_at)::DATE as week_start,
    COUNT(*) as count
  FROM public.profiles
  WHERE created_at >= CURRENT_DATE - (weeks_back * 7 || ' days')::INTERVAL
  GROUP BY DATE_TRUNC('week', created_at)
  ORDER BY week_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_email TEXT,
  p_action TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_email, user_id, action, description, metadata)
  VALUES (p_user_email, auth.uid(), p_action, p_description, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 12. SAMPLE DATA (Optional - remove in production)
-- =============================================

-- Insert default feature flags
INSERT INTO public.feature_flags (name, key, description, enabled, section, rollout_percentage, enabled_for_plans) VALUES
  ('Maintenance Mode', 'maintenance_mode', 'Puts site in read-only mode', false, 'Core Features', 100, '{}'),
  ('New Signups', 'new_signups_enabled', 'Allow new user registrations', true, 'Core Features', 100, '{}'),
  ('Free Tier', 'free_tier_enabled', 'Allow free plan signups', true, 'Core Features', 100, '{}'),
  ('Prompt History', 'prompt_history', 'Save and view prompt history', true, 'Core Features', 100, '{}'),
  ('Prompt Sharing', 'prompt_sharing', 'Share prompts with other users', true, 'Core Features', 100, '{"pro", "enterprise"}'),
  ('New Editor UI', 'new_editor_ui', 'New prompt editor interface', false, 'Experimental', 10, '{"enterprise"}'),
  ('Voice Input', 'voice_input', 'Voice input for prompts', false, 'Experimental', 0, '{}'),
  ('AI Model Comparison', 'ai_model_comparison', 'Compare outputs from multiple models', true, 'Experimental', 50, '{"pro", "enterprise"}')
ON CONFLICT (key) DO NOTHING;

-- Insert default AI models
INSERT INTO public.ai_models (name, provider, enabled, is_default, available_for_plans, input_cost_per_million, output_cost_per_million, max_tokens) VALUES
  ('GPT-4o', 'OpenAI', true, true, '{"pro", "enterprise"}', 2.50, 10.00, 128000),
  ('GPT-3.5 Turbo', 'OpenAI', true, false, '{"free", "pro", "enterprise"}', 0.50, 1.50, 16384),
  ('Claude 3.5 Sonnet', 'Anthropic', true, false, '{"pro", "enterprise"}', 3.00, 15.00, 200000),
  ('Claude 3 Haiku', 'Anthropic', true, false, '{"free", "pro", "enterprise"}', 0.25, 1.25, 200000),
  ('Gemini 1.5 Pro', 'Google', false, false, '{"enterprise"}', 1.25, 5.00, 1000000)
ON CONFLICT DO NOTHING;

-- Insert default prompt templates
INSERT INTO public.prompt_templates (name, category, description, template, variables) VALUES
  ('Code Review Assistant', 'Coding', 'Analyzes code for bugs, security issues, and best practices', 'Review the following {language} code for {focus_areas}:\n\n{code}', '{"code", "language", "focus_areas"}'),
  ('Marketing Copy Generator', 'Marketing', 'Creates compelling marketing copy for products and services', 'Write marketing copy for {product} targeting {audience} with a {tone} tone.', '{"product", "audience", "tone"}'),
  ('Blog Post Outline', 'Creative Writing', 'Generates structured outlines for blog posts', 'Create a detailed blog post outline about {topic}, targeting {word_count} words.', '{"topic", "word_count"}'),
  ('Business Proposal', 'Business', 'Drafts professional business proposals', 'Draft a business proposal for {service} for {client}.', '{"service", "client"}'),
  ('API Documentation', 'Coding', 'Generates comprehensive API documentation', 'Generate API documentation for {method} {endpoint} with parameters: {parameters}', '{"endpoint", "method", "parameters"}')
ON CONFLICT DO NOTHING;

SELECT '✅ Admin portal tables created successfully!' as status;
