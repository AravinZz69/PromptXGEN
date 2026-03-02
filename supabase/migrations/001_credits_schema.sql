-- =============================================
-- PROMPT GENIUS - CREDITS SYSTEM SCHEMA
-- =============================================
-- Run in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CREDIT PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.credit_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE CHECK (plan_name IN ('free', 'pro', 'enterprise')),
  monthly_credits INTEGER NOT NULL,
  price_usd DECIMAL(10,2) DEFAULT 0,
  price_inr DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default plans
INSERT INTO public.credit_plans (plan_name, monthly_credits, price_usd, price_inr, features) VALUES
  ('free', 100, 0, 0, '["100 credits/month", "Basic templates", "Email support"]'::jsonb),
  ('pro', 5000, 9.99, 499, '["5000 credits/month", "All templates", "Priority support", "Advanced analytics"]'::jsonb),
  ('enterprise', -1, 39.99, 1999, '["Unlimited credits", "Custom templates", "24/7 support", "API access", "Team management"]'::jsonb)
ON CONFLICT (plan_name) DO NOTHING;

-- =============================================
-- 2. USER CREDITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_credits INTEGER DEFAULT 100,
  used_credits INTEGER DEFAULT 0,
  remaining_credits INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN total_credits = -1 THEN 999999  -- Unlimited (enterprise)
      ELSE GREATEST(total_credits - used_credits, 0)
    END
  ) STORED,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  reset_date TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access" ON public.user_credits
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 3. CREDIT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deduct', 'refund', 'topup', 'reset', 'signup_bonus')),
  description TEXT,
  model_used TEXT,
  prompt_length INTEGER DEFAULT 0,
  response_length INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access transactions" ON public.credit_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 4. MODEL CREDIT COSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.model_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL UNIQUE,
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 1,
  cost_per_100_prompt_tokens DECIMAL(10,2) DEFAULT 0.5,
  cost_per_100_response_tokens DECIMAL(10,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed model costs
INSERT INTO public.model_costs (model_name, base_cost, cost_per_100_prompt_tokens, cost_per_100_response_tokens) VALUES
  ('gemini-flash', 1, 0.5, 0.5),
  ('gemini-2.0-flash', 1, 0.5, 0.5),
  ('llama-3.3-70b-versatile', 2, 0.5, 0.5),
  ('llama-3.1-70b-versatile', 2, 0.5, 0.5),
  ('gpt-4o', 5, 0.5, 0.5),
  ('gpt-4o-mini', 3, 0.5, 0.5),
  ('claude-3-5-sonnet', 5, 0.5, 0.5),
  ('claude-3-haiku', 2, 0.5, 0.5),
  ('deepseek-r1', 3, 0.5, 0.5),
  ('deepseek-chat', 2, 0.5, 0.5),
  ('default', 1, 0.5, 0.5)
ON CONFLICT (model_name) DO NOTHING;

-- =============================================
-- 5. TRIGGER: AUTO-CREATE USER CREDITS ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user credits with free plan
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, plan_type, reset_date)
  VALUES (
    NEW.id,
    100,  -- Free plan credits
    0,
    'free',
    date_trunc('month', NOW()) + INTERVAL '1 month'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record signup bonus transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 100, 'signup_bonus', 'Welcome bonus - Free plan credits');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- =============================================
-- 6. FUNCTION: DEDUCT CREDITS
-- =============================================
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_model TEXT,
  p_prompt_tokens INTEGER DEFAULT 0,
  p_response_tokens INTEGER DEFAULT 0,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, remaining INTEGER, cost DECIMAL) AS $$
DECLARE
  v_base_cost DECIMAL;
  v_prompt_cost DECIMAL;
  v_response_cost DECIMAL;
  v_total_cost DECIMAL;
  v_user_credits RECORD;
BEGIN
  -- Get model cost (use default if not found)
  SELECT 
    COALESCE(mc.base_cost, 1),
    COALESCE(mc.cost_per_100_prompt_tokens, 0.5),
    COALESCE(mc.cost_per_100_response_tokens, 0.5)
  INTO v_base_cost, v_prompt_cost, v_response_cost
  FROM public.model_costs mc
  WHERE mc.model_name = p_model;
  
  IF NOT FOUND THEN
    v_base_cost := 1;
    v_prompt_cost := 0.5;
    v_response_cost := 0.5;
  END IF;
  
  -- Calculate total cost
  v_total_cost := v_base_cost + 
    (p_prompt_tokens / 100.0 * v_prompt_cost) + 
    (p_response_tokens / 100.0 * v_response_cost);
  
  -- Round up to nearest integer
  v_total_cost := CEIL(v_total_cost);
  
  -- Get user credits
  SELECT * INTO v_user_credits FROM public.user_credits WHERE user_id = p_user_id;
  
  -- Check if user has unlimited credits (enterprise)
  IF v_user_credits.total_credits = -1 THEN
    -- Log transaction but don't deduct
    INSERT INTO public.credit_transactions (user_id, amount, type, description, model_used, prompt_length, response_length)
    VALUES (p_user_id, v_total_cost, 'deduct', COALESCE(p_description, 'AI generation'), p_model, p_prompt_tokens, p_response_tokens);
    
    RETURN QUERY SELECT TRUE, 999999::INTEGER, v_total_cost;
    RETURN;
  END IF;
  
  -- Check if user has enough credits
  IF v_user_credits.remaining_credits < v_total_cost THEN
    RETURN QUERY SELECT FALSE, v_user_credits.remaining_credits::INTEGER, v_total_cost;
    RETURN;
  END IF;
  
  -- Deduct credits
  UPDATE public.user_credits 
  SET 
    used_credits = used_credits + v_total_cost::INTEGER,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, model_used, prompt_length, response_length)
  VALUES (p_user_id, v_total_cost, 'deduct', COALESCE(p_description, 'AI generation'), p_model, p_prompt_tokens, p_response_tokens);
  
  -- Get updated remaining credits
  SELECT remaining_credits INTO v_user_credits.remaining_credits 
  FROM public.user_credits WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT TRUE, v_user_credits.remaining_credits::INTEGER, v_total_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. FUNCTION: CHECK CREDITS
-- =============================================
CREATE OR REPLACE FUNCTION public.check_user_credits(p_user_id UUID)
RETURNS TABLE(has_credits BOOLEAN, remaining INTEGER, plan TEXT, total INTEGER, used INTEGER, reset_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (uc.remaining_credits > 0 OR uc.total_credits = -1) AS has_credits,
    uc.remaining_credits::INTEGER,
    uc.plan_type,
    uc.total_credits::INTEGER,
    uc.used_credits::INTEGER,
    uc.reset_date
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. FUNCTION: RESET MONTHLY CREDITS (for cron job)
-- =============================================
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void AS $$
BEGIN
  -- Reset credits for users whose reset_date has passed
  UPDATE public.user_credits
  SET 
    used_credits = 0,
    reset_date = date_trunc('month', NOW()) + INTERVAL '1 month',
    updated_at = NOW()
  WHERE reset_date <= NOW() AND total_credits != -1;
  
  -- Log reset transactions
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  SELECT 
    user_id, 
    total_credits, 
    'reset', 
    'Monthly credit reset'
  FROM public.user_credits
  WHERE reset_date <= NOW() AND total_credits != -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_costs_model_name ON public.model_costs(model_name);

-- =============================================
-- 10. GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.credit_plans TO anon, authenticated;
GRANT SELECT ON public.model_costs TO anon, authenticated;
GRANT SELECT, UPDATE ON public.user_credits TO authenticated;
GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_user_credits TO authenticated;
