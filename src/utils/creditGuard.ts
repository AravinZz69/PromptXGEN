import { supabase } from '@/lib/supabase';
import { MODEL_COSTS } from '@/hooks/useCredits';

export class CreditExhaustedError extends Error {
  remaining: number;
  
  constructor(remaining: number) {
    super('You have run out of credits. Please upgrade your plan to continue.');
    this.name = 'CreditExhaustedError';
    this.remaining = remaining;
  }
}

export class InsufficientCreditsError extends Error {
  remaining: number;
  required: number;
  
  constructor(remaining: number, required: number) {
    super(`Insufficient credits. You have ${remaining} credits but need ${required}.`);
    this.name = 'InsufficientCreditsError';
    this.remaining = remaining;
    this.required = required;
  }
}

interface CheckCreditsResult {
  hasCredits: boolean;
  remaining: number;
  plan: string;
  total: number;
  used: number;
}

interface DeductCreditsResult {
  success: boolean;
  remaining: number;
  cost: number;
  error?: string;
}

// Estimate tokens from text (rough approximation: ~4 chars per token)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Calculate credit cost for a generation
export function calculateCreditCost(
  model: string,
  promptTokens: number,
  responseTokens: number
): number {
  const baseCost = MODEL_COSTS[model] || MODEL_COSTS['default'];
  const promptCost = (promptTokens / 100) * 0.5;
  const responseCost = (responseTokens / 100) * 0.5;
  return Math.ceil(baseCost + promptCost + responseCost);
}

// Check if user has credits
export async function checkCredits(): Promise<CheckCreditsResult> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  // Use RPC function if available, otherwise query directly
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error) {
    // If no record, return defaults (trigger should create on signup)
    if (error.code === 'PGRST116') {
      return {
        hasCredits: true,
        remaining: 20,
        plan: 'free',
        total: 20,
        used: 0,
      };
    }
    throw error;
  }

  const remaining = data.credits_balance ?? (data.total_credits - data.used_credits) ?? 20;
  
  return {
    hasCredits: remaining > 0 || data.plan_type === 'enterprise',
    remaining: remaining,
    plan: data.plan_type,
    total: data.total_credits,
    used: data.used_credits,
  };
}

// Deduct credits after successful AI call
export async function deductCredits(
  model: string,
  promptTokens: number,
  responseTokens: number,
  description?: string
): Promise<DeductCreditsResult> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  // Calculate the credit cost
  const cost = calculateCreditCost(model, promptTokens, responseTokens);

  // Use RPC function to deduct credits atomically
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: session.user.id,
    p_amount: cost,
    p_description: description || `AI generation using ${model}`,
  });

  if (error) {
    console.error('Failed to deduct credits:', error);
    throw error;
  }

  return {
    success: data?.success ?? false,
    remaining: data?.new_balance ?? 0,
    cost: data?.deducted ?? cost,
    error: data?.error,
  };
}

// Credit guard wrapper for AI calls
export async function withCreditGuard<T>(
  model: string,
  promptText: string,
  aiCall: () => Promise<{ result: T; responseText: string }>,
  onLowCredits?: (remaining: number) => void,
  onDeducted?: (cost: number, remaining: number) => void
): Promise<T> {
  // Check credits before making the call
  const creditStatus = await checkCredits();
  
  if (!creditStatus.hasCredits) {
    throw new CreditExhaustedError(creditStatus.remaining);
  }
  
  // Warn if credits are low (< 10)
  if (creditStatus.remaining < 10 && creditStatus.plan !== 'enterprise') {
    onLowCredits?.(creditStatus.remaining);
  }

  // Make the AI call
  const { result, responseText } = await aiCall();
  
  // Calculate tokens and deduct credits
  const promptTokens = estimateTokens(promptText);
  const responseTokens = estimateTokens(responseText);
  
  try {
    const deductResult = await deductCredits(model, promptTokens, responseTokens);
    
    if (!deductResult.success) {
      console.warn('Credit deduction failed but call succeeded');
    } else {
      onDeducted?.(deductResult.cost, deductResult.remaining);
    }
  } catch (err) {
    // Log but don't fail the AI call if credit deduction fails
    console.error('Failed to deduct credits:', err);
  }
  
  return result;
}

// Simple pre-check guard (throws if no credits)
export async function requireCredits(): Promise<CheckCreditsResult> {
  const status = await checkCredits();
  
  if (!status.hasCredits) {
    throw new CreditExhaustedError(status.remaining);
  }
  
  return status;
}

// Post-call credit deduction (call after successful AI response)
export async function recordCreditUsage(
  model: string,
  promptText: string,
  responseText: string,
  description?: string
): Promise<DeductCreditsResult> {
  const promptTokens = estimateTokens(promptText);
  const responseTokens = estimateTokens(responseText);
  
  return deductCredits(model, promptTokens, responseTokens, description);
}
