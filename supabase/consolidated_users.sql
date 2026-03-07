-- =============================================
-- CONSOLIDATED USER MIGRATIONS
-- =============================================
-- This file contains all user-related tables, functions, and policies
-- Includes: user_profiles, user_notifications, user_analytics, chat_conversations
-- =============================================
-- Run this in Supabase SQL Editor
-- =============================================



-- =============================================
-- SECTION 1: USER PROFILE EXTENDED COLUMNS
-- =============================================
-- Adds mobile, city, role, use_case, experience_level columns

-- Add new columns to user_profiles table if they don't exist
DO $$ 
BEGIN
    -- Add mobile column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'mobile') THEN
        ALTER TABLE public.user_profiles ADD COLUMN mobile TEXT;
    END IF;

    -- Add city column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'city') THEN
        ALTER TABLE public.user_profiles ADD COLUMN city TEXT;
    END IF;

    -- Add role column (user's profession/role)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'role') THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'Student';
    END IF;

    -- Add use_case column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'use_case') THEN
        ALTER TABLE public.user_profiles ADD COLUMN use_case TEXT;
    END IF;

    -- Add experience_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'experience_level') THEN
        ALTER TABLE public.user_profiles ADD COLUMN experience_level TEXT DEFAULT 'beginner';
    END IF;
END $$;



-- =============================================
-- SECTION 2: USER ANALYTICS TABLE
-- =============================================
-- Tracks user activity and usage statistics

CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_prompts_generated INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    total_credits_spent INTEGER DEFAULT 0,
    prompts_this_month INTEGER DEFAULT 0,
    prompts_this_week INTEGER DEFAULT 0,
    favorite_model TEXT,
    favorite_prompt_type TEXT,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_analytics
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for user_analytics
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_analytics' AND policyname = 'Users can view own analytics') THEN
        CREATE POLICY "Users can view own analytics" ON public.user_analytics
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_analytics' AND policyname = 'Users can update own analytics') THEN
        CREATE POLICY "Users can update own analytics" ON public.user_analytics
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_analytics' AND policyname = 'Users can insert own analytics') THEN
        CREATE POLICY "Users can insert own analytics" ON public.user_analytics
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create function to update user analytics after prompt generation
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_analytics (user_id, total_prompts_generated, total_tokens_used, total_credits_spent, prompts_this_month, prompts_this_week, last_activity_at)
    VALUES (NEW.user_id, 1, COALESCE(NEW.tokens_used, 0), COALESCE(NEW.credits_used, 1), 1, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        total_prompts_generated = user_analytics.total_prompts_generated + 1,
        total_tokens_used = user_analytics.total_tokens_used + COALESCE(NEW.tokens_used, 0),
        total_credits_spent = user_analytics.total_credits_spent + COALESCE(NEW.credits_used, 1),
        prompts_this_month = CASE 
            WHEN EXTRACT(MONTH FROM user_analytics.last_activity_at) = EXTRACT(MONTH FROM NOW()) 
            THEN user_analytics.prompts_this_month + 1 
            ELSE 1 
        END,
        prompts_this_week = CASE 
            WHEN EXTRACT(WEEK FROM user_analytics.last_activity_at) = EXTRACT(WEEK FROM NOW()) 
            THEN user_analytics.prompts_this_week + 1 
            ELSE 1 
        END,
        favorite_model = NEW.model,
        favorite_prompt_type = NEW.prompt_type,
        last_activity_at = NOW(),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update analytics on prompt generation
DROP TRIGGER IF EXISTS update_analytics_on_prompt ON public.prompt_history;
CREATE TRIGGER update_analytics_on_prompt
    AFTER INSERT ON public.prompt_history
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analytics();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);



-- =============================================
-- SECTION 3: USER NOTIFICATIONS TABLE
-- =============================================
-- Stores notifications delivered to individual users

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

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.user_notifications;

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

-- Function to send notification to all users
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



-- =============================================
-- SECTION 4: CHAT CONVERSATIONS TABLE
-- =============================================
-- Stores AI chat conversation history for users

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]',
  model TEXT DEFAULT 'llama-3.3-70b-versatile',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can delete any conversation" ON public.chat_conversations;

-- RLS Policies

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own conversations
CREATE POLICY "Users can insert own conversations"
  ON public.chat_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON public.chat_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON public.chat_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversations_updated_at();

-- Admin can view all conversations (requires is_admin function)
CREATE POLICY "Admins can view all conversations"
  ON public.chat_conversations
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admin can delete any conversation
CREATE POLICY "Admins can delete any conversation"
  ON public.chat_conversations
  FOR DELETE
  USING (public.is_admin(auth.uid()));



-- =============================================
-- SECTION 5: CONTACT FORM / SUPPORT TICKET POLICY
-- =============================================
-- Allow anyone (including unauthenticated) to create support tickets

-- Drop existing insert policy if it's too restrictive
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;

-- Allow anyone (including unauthenticated users) to create support tickets
-- This enables the contact form to work for all visitors
CREATE POLICY "Anyone can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

-- Users can still view their own tickets if logged in
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (
    user_id = auth.uid() 
    OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );



-- =============================================
-- VERIFICATION
-- =============================================
SELECT '✅ User migrations complete!' as status;
SELECT 'user_analytics' as table_name, COUNT(*) as count FROM user_analytics
UNION ALL
SELECT 'user_notifications', COUNT(*) FROM user_notifications
UNION ALL
SELECT 'chat_conversations', COUNT(*) FROM chat_conversations;
