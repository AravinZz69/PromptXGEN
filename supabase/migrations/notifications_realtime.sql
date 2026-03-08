-- Enable realtime for notifications tables
-- Run this in your Supabase SQL editor

-- 1. Enable realtime for user_notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;

-- 2. Enable realtime for admin_notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;

-- 3. Enable realtime for notification_templates table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_templates') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notification_templates;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON public.user_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_sent_at ON public.admin_notifications(sent_at DESC);

-- 5. Add RLS policy for authenticated users to have notifications inserted for them
-- (This allows the RPC function to insert into their notifications)
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.user_notifications;
CREATE POLICY "Service role can insert notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (TRUE);

-- 6. Update the send_notification_to_users function to also handle action_url
CREATE OR REPLACE FUNCTION public.send_notification_to_users(
  p_admin_notification_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_audience TEXT DEFAULT 'all',
  p_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Insert notification for each matching user
  INSERT INTO public.user_notifications (user_id, admin_notification_id, title, message, type, priority, action_url)
  SELECT 
    p.id,
    p_admin_notification_id,
    p_title,
    p_message,
    'announcement',
    p_priority,
    p_action_url
  FROM public.profiles p
  WHERE 
    CASE 
      WHEN p_audience = 'all' THEN TRUE
      WHEN p_audience = 'pro' THEN COALESCE(p.plan, 'free') = 'pro'
      WHEN p_audience = 'enterprise' THEN COALESCE(p.plan, 'free') = 'enterprise'
      WHEN p_audience = 'free' THEN COALESCE(p.plan, 'free') = 'free'
      ELSE TRUE
    END;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Update the admin_notification with actual recipient count
  UPDATE public.admin_notifications 
  SET recipients = v_count 
  WHERE id = p_admin_notification_id;
  
  RETURN v_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.send_notification_to_users TO authenticated;

-- 7. Create function to mark notification as read and update open rate
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_total_count INTEGER;
  v_read_count INTEGER;
BEGIN
  -- Get the admin notification ID
  SELECT admin_notification_id INTO v_admin_id
  FROM public.user_notifications
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  -- Update the user notification
  UPDATE public.user_notifications
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  -- Update open rate on admin notification if linked
  IF v_admin_id IS NOT NULL THEN
    SELECT 
      COUNT(*),
      COUNT(*) FILTER (WHERE read = TRUE)
    INTO v_total_count, v_read_count
    FROM public.user_notifications
    WHERE admin_notification_id = v_admin_id;
    
    IF v_total_count > 0 THEN
      UPDATE public.admin_notifications
      SET open_rate = (v_read_count::NUMERIC / v_total_count::NUMERIC) * 100
      WHERE id = v_admin_id;
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_notification_read TO authenticated;

-- 8. Create notification_templates table if not exists
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'announcement' CHECK (category IN ('onboarding', 'billing', 'announcement', 'security', 'digest')),
  audience TEXT DEFAULT 'all' CHECK (audience IN ('all', 'free', 'pro', 'enterprise')),
  channels TEXT[] DEFAULT ARRAY['email', 'in-app'],
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Admin can manage templates
DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
  FOR ALL USING (public.is_admin(auth.uid()));

-- All authenticated users can read active templates
DROP POLICY IF EXISTS "Authenticated users can read active templates" ON public.notification_templates;
CREATE POLICY "Authenticated users can read active templates" ON public.notification_templates
  FOR SELECT USING (is_active = TRUE);

-- Function to increment template usage
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notification_templates
  SET uses_count = uses_count + 1, updated_at = NOW()
  WHERE id = template_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_template_usage TO authenticated;

COMMIT;
