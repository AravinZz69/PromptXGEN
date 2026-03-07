-- =============================================
-- NOTIFICATION TEMPLATES TABLE
-- Stores reusable notification templates for admin
-- =============================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT DEFAULT 'all' CHECK (audience IN ('all', 'free', 'pro', 'enterprise')),
  channels TEXT[] DEFAULT '{"email", "in-app"}',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON public.notification_templates(category);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can view notification_templates" ON public.notification_templates
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage notification_templates" ON public.notification_templates
  FOR ALL USING (public.is_admin(auth.uid()));

-- Insert default templates
INSERT INTO public.notification_templates (name, description, title, message, audience, channels, priority, category) VALUES
  ('Welcome Email', 'Sent to new users after signup', 'Welcome to PromptXGEN! 🎉', 'Hi there! Welcome to PromptXGEN. We''re excited to have you on board. Start generating powerful prompts today and unlock your AI potential. You have 20 free credits to get started!', 'all', '{"email", "in-app"}', 'normal', 'onboarding'),
  ('Payment Failed', 'Alert when payment processing fails', 'Payment Failed - Action Required', 'We couldn''t process your payment for your subscription. Please update your payment method to continue enjoying Pro features. Your account will be downgraded in 3 days if not resolved.', 'pro', '{"email", "in-app"}', 'high', 'billing'),
  ('Feature Announcement', 'New feature release notification', 'New Feature: {{feature_name}}', 'We''ve just launched a new feature! {{feature_description}} Check it out now and let us know what you think.', 'all', '{"email", "in-app"}', 'normal', 'announcement'),
  ('Weekly Digest', 'Weekly usage summary email', 'Your Weekly PromptXGEN Report 📊', 'Here''s your weekly summary: You generated {{prompts_count}} prompts this week. Your most used category was {{top_category}}. You have {{credits_remaining}} credits remaining.', 'all', '{"email"}', 'low', 'digest'),
  ('Plan Upgrade', 'Confirmation for plan upgrades', 'Welcome to Pro! 🚀', 'Congratulations on upgrading to Pro! You now have access to advanced features, unlimited prompts, and priority support. Your monthly credits have been increased to 500.', 'pro', '{"email", "in-app"}', 'normal', 'billing'),
  ('Account Security', 'Security alerts and notices', 'Security Alert: New Login Detected', 'We detected a new login to your account from {{device}} in {{location}}. If this wasn''t you, please change your password immediately and contact support.', 'all', '{"email", "in-app", "push"}', 'high', 'security'),
  ('Low Credits Warning', 'Alert when credits are running low', 'Low Credits Alert ⚠️', 'You have only {{credits_remaining}} credits left. Consider upgrading to Pro for more credits or purchase additional credits to continue generating prompts.', 'all', '{"in-app"}', 'normal', 'billing'),
  ('Subscription Renewal', 'Upcoming subscription renewal notice', 'Your Subscription Renews Soon', 'Your Pro subscription will renew on {{renewal_date}} for ${{amount}}. Make sure your payment method is up to date. Thanks for being a Pro member!', 'pro', '{"email"}', 'normal', 'billing')
ON CONFLICT DO NOTHING;

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notification_templates 
  SET uses_count = uses_count + 1 
  WHERE id = template_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_template_usage TO authenticated;
