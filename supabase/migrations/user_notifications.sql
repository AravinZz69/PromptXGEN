-- =============================================
-- USER NOTIFICATIONS TABLE
-- Stores notifications delivered to individual users
-- =============================================

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

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can insert notifications for any user
CREATE POLICY "Admins can insert notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Admins can delete any notification
CREATE POLICY "Admins can delete notifications" ON public.user_notifications
  FOR DELETE USING (public.is_admin(auth.uid()));

-- =============================================
-- FUNCTION TO SEND NOTIFICATION TO ALL USERS
-- Called when admin sends an in-app notification
-- =============================================

CREATE OR REPLACE FUNCTION public.send_notification_to_users(
  p_admin_notification_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_audience TEXT DEFAULT 'all',
  p_priority TEXT DEFAULT 'normal'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Insert notification for each matching user
  INSERT INTO public.user_notifications (user_id, admin_notification_id, title, message, type, priority)
  SELECT 
    p.id,
    p_admin_notification_id,
    p_title,
    p_message,
    'announcement',
    p_priority
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
