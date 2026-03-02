-- =============================================
-- PROMPT GENIUS - SUPABASE DATABASE SETUP
-- =============================================
-- Run these queries in the Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/uwdldzfkemirasthgpzd/sql
-- =============================================

-- =============================================
-- 1. USER PROFILES TABLE
-- =============================================
-- Stores additional user information beyond auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 10,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  prompts_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
-- Trigger to automatically create a profile when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 3. PROMPTS TABLE
-- =============================================
-- Stores generated prompts history

CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  input_text TEXT NOT NULL,
  generated_prompt TEXT NOT NULL,
  prompt_type TEXT DEFAULT 'basic' CHECK (prompt_type IN ('basic', 'advanced', 'chain-of-thought')),
  target_model TEXT DEFAULT 'chatgpt' CHECK (target_model IN ('chatgpt', 'claude', 'gemini', 'midjourney', 'other')),
  category TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompts
CREATE POLICY "Users can view own prompts" ON public.prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts" ON public.prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON public.prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON public.prompts
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. TEMPLATES TABLE
-- =============================================
-- Stores prompt templates

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_text TEXT NOT NULL,
  category TEXT NOT NULL,
  target_model TEXT DEFAULT 'all',
  is_premium BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (templates are public read)
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
CREATE POLICY "Anyone can view templates" ON public.templates
  FOR SELECT USING (true);

-- =============================================
-- 5. USER TEMPLATES (Saved/Custom)
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  custom_name TEXT,
  custom_template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own saved templates" ON public.user_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save templates" ON public.user_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved templates" ON public.user_templates
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 6. CHAT HISTORY TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Chat',
  model TEXT DEFAULT 'chatgpt',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = chat_messages.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = chat_messages.session_id 
      AND user_id = auth.uid()
    )
  );

-- =============================================
-- 7. CREDIT TRANSACTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'subscription')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 8. SUBSCRIPTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 9. HELPER FUNCTIONS
-- =============================================

-- Function to decrement user credits
CREATE OR REPLACE FUNCTION public.use_credit(user_uuid UUID, amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM public.profiles WHERE id = user_uuid;
  
  IF current_credits >= amount THEN
    UPDATE public.profiles 
    SET credits = credits - amount,
        prompts_generated = prompts_generated + 1,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (user_uuid, -amount, 'usage', 'Prompt generation');
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(user_uuid UUID, amount INTEGER, transaction_type TEXT DEFAULT 'purchase', desc_text TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET credits = credits + amount,
      updated_at = NOW()
  WHERE id = user_uuid;
  
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (user_uuid, amount, transaction_type, desc_text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);

-- =============================================
-- 11. SEED DATA - DEFAULT TEMPLATES
-- =============================================

INSERT INTO public.templates (name, description, template_text, category, target_model, is_premium) VALUES
('Blog Post Writer', 'Generate engaging blog posts on any topic', 'Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, 3-5 main sections with subheadings, practical examples, and a compelling conclusion with a call to action. Target audience: [AUDIENCE]. Tone: [TONE].', 'writing', 'all', false),
('SEO Meta Description', 'Create optimized meta descriptions', 'Write an SEO-optimized meta description for a webpage about [TOPIC]. Keep it under 160 characters, include the primary keyword [KEYWORD], and make it compelling enough to improve click-through rates.', 'seo', 'all', false),
('Email Subject Lines', 'Generate compelling email subject lines', 'Generate 10 compelling email subject lines for [EMAIL_PURPOSE]. The target audience is [AUDIENCE]. Include a mix of curiosity-driven, benefit-focused, and urgency-based subject lines. Keep each under 50 characters.', 'marketing', 'all', false),
('Code Review', 'Get detailed code review feedback', 'Review the following code and provide: 1) Potential bugs or issues, 2) Performance improvements, 3) Code style and best practices suggestions, 4) Security considerations. Code: [CODE]', 'coding', 'all', false),
('Social Media Post', 'Create engaging social media content', 'Create a [PLATFORM] post about [TOPIC]. Include relevant hashtags, an engaging hook, and a clear call-to-action. Tone should be [TONE]. Character limit: [LIMIT].', 'marketing', 'all', false),
('Product Description', 'Write compelling product descriptions', 'Write a compelling product description for [PRODUCT]. Highlight key features, benefits, and unique selling points. Target audience: [AUDIENCE]. Include sensory language and address potential objections.', 'marketing', 'all', false),
('Chain of Thought Reasoning', 'Advanced reasoning prompt template', 'Let''s solve this step by step:\n\nProblem: [PROBLEM]\n\nFirst, I''ll identify the key components of this problem.\nThen, I''ll analyze each component systematically.\nNext, I''ll consider possible solutions and their trade-offs.\nFinally, I''ll synthesize my findings into a clear recommendation.\n\nPlease walk through your reasoning process explicitly.', 'advanced', 'all', true),
('Image Generation', 'Create detailed image prompts', 'Create a detailed image of [SUBJECT]. Style: [STYLE]. Lighting: [LIGHTING]. Mood: [MOOD]. Camera angle: [ANGLE]. Additional details: [DETAILS]. --ar [ASPECT_RATIO] --v 5', 'image', 'midjourney', false)
ON CONFLICT DO NOTHING;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- After running these queries:
-- 1. Enable Google OAuth in Authentication > Providers
-- 2. Enable GitHub OAuth in Authentication > Providers  
-- 3. Set Site URL in Authentication > URL Configuration
-- 4. Add redirect URLs for OAuth callbacks
-- =============================================
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );


CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);


CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);




-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Avatar public read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated upload
CREATE POLICY "Avatar authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow update own files
CREATE POLICY "Avatar update own" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Allow delete own files  
CREATE POLICY "Avatar delete own" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);