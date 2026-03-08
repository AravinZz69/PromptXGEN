-- Enable realtime for notifications tables
-- Run this in your Supabase SQL editor

-- 1. Create admin_notifications table if not exists
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT DEFAULT 'all' CHECK (audience IN ('all', 'free', 'pro', 'enterprise')),
  channels TEXT[] DEFAULT ARRAY['email', 'in-app'],
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Sent', 'Failed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  recipients INTEGER DEFAULT 0,
  open_rate NUMERIC DEFAULT 0,
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin can manage admin_notifications
DROP POLICY IF EXISTS "Admins can manage admin_notifications" ON public.admin_notifications;
CREATE POLICY "Admins can manage admin_notifications" ON public.admin_notifications
  FOR ALL USING (public.is_admin(auth.uid()));

-- 2. Create user_notifications table if not exists
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_notification_id UUID REFERENCES public.admin_notifications(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON public.user_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON public.admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_sent_at ON public.admin_notifications(sent_at DESC);

-- Enable RLS on user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.user_notifications;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow inserts (for the RPC function with SECURITY DEFINER)
CREATE POLICY "Service role can insert notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (TRUE);

-- Admins can delete any notification
CREATE POLICY "Admins can delete notifications" ON public.user_notifications
  FOR DELETE USING (public.is_admin(auth.uid()));

-- 3. Enable realtime for user_notifications table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Enable realtime for admin_notifications table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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
