-- Add onboarding fields to user_profiles table
-- These fields track whether a user has completed onboarding

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add role column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE public.user_profiles ADD COLUMN role TEXT;
  END IF;

  -- Add use_case column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'use_case') THEN
    ALTER TABLE public.user_profiles ADD COLUMN use_case TEXT;
  END IF;

  -- Add experience_level column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'experience_level') THEN
    ALTER TABLE public.user_profiles ADD COLUMN experience_level TEXT;
  END IF;

  -- Add mobile column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'mobile') THEN
    ALTER TABLE public.user_profiles ADD COLUMN mobile TEXT;
  END IF;

  -- Add city column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'city') THEN
    ALTER TABLE public.user_profiles ADD COLUMN city TEXT;
  END IF;

  -- Add onboarding_completed column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing users: mark onboarding as completed if they have role set
UPDATE public.user_profiles 
SET onboarding_completed = true 
WHERE role IS NOT NULL AND use_case IS NOT NULL AND experience_level IS NOT NULL;
