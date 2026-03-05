-- =============================================
-- CHAT CONVERSATIONS TABLE
-- =============================================
-- Stores AI chat conversation history for users
-- =============================================

-- Create chat_conversations table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);

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

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversations_updated_at();

-- =============================================
-- ADMIN POLICIES FOR CHAT_CONVERSATIONS
-- =============================================
-- Allow admins to view all chat conversations

-- Admin can view all conversations (requires is_admin function)
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
CREATE POLICY "Admins can view all conversations"
  ON public.chat_conversations
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- Admin can delete any conversation
DROP POLICY IF EXISTS "Admins can delete any conversation" ON public.chat_conversations;
CREATE POLICY "Admins can delete any conversation"
  ON public.chat_conversations
  FOR DELETE
  USING (
    public.is_admin(auth.uid())
  );
