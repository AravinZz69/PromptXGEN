-- ══════════════════════════════════════════════════════════════════════════════
-- Seed the current live AI model (Groq llama-3.3-70b-versatile)
-- This is the model currently in use for chat and prompt generation
-- ══════════════════════════════════════════════════════════════════════════════

-- Insert the Groq model that's currently being used
INSERT INTO public.ai_models (
  name,
  provider,
  enabled,
  is_default,
  available_for_plans,
  input_cost_per_million,
  output_cost_per_million,
  max_tokens,
  api_key_encrypted,
  tokens_used,
  requests_today,
  avg_latency_ms
) VALUES (
  'llama-3.3-70b-versatile',
  'Groq',
  true,
  true,
  ARRAY['free', 'pro', 'enterprise'],
  0.59,  -- Groq pricing: $0.59 per million input tokens
  0.79,  -- Groq pricing: $0.79 per million output tokens
  32768, -- Max context window for llama-3.3-70b
  NULL,  -- API key will use environment variable fallback (VITE_GROQ_API_KEY)
  0,
  0,
  0
)
ON CONFLICT DO NOTHING; -- Don't error if already exists
