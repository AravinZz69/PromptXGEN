-- =============================================
-- USER PROFILE EXTENDED COLUMNS MIGRATION
-- Adds mobile, city, role, use_case, experience_level columns
-- =============================================

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

-- Create user_analytics table for tracking user activity
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
