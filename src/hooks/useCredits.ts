import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserCredits {
  id: string;
  userId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  planType: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deduction' | 'topup' | 'refund' | 'bonus' | 'reset' | 'admin_grant';
  description: string | null;
  createdAt: string;
}

interface UseCreditsReturn {
  credits: UserCredits | null;
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: Error | null;
  hasCredits: boolean;
  isLowCredits: boolean;
  creditPercentage: number;
  refetch: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
}

export function useCredits(): UseCreditsReturn {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to get existing credits
      let { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no record exists, create one with 20 free credits
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: user.id,
            credits_balance: 20,
            total_credits: 20,
            used_credits: 0,
            plan_type: 'free',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;

        // Log the signup bonus
        await supabase.from('credit_transactions').insert({
          user_id: user.id,
          amount: 20,
          transaction_type: 'bonus',
          description: 'Welcome bonus - Free signup credits',
        });
      } else if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setCredits({
          id: data.id,
          userId: data.user_id,
          totalCredits: data.total_credits || 20,
          usedCredits: data.used_credits || 0,
          remainingCredits: data.credits_balance ?? (data.total_credits - data.used_credits),
          planType: data.plan_type || 'free',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchTransactions = useCallback(async (limit = 10) => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setTransactions(
        (data || []).map((t) => ({
          id: t.id,
          userId: t.user_id,
          amount: t.amount,
          type: t.transaction_type,
          description: t.description,
          createdAt: t.created_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Calculate derived values
  const hasCredits = credits ? credits.remainingCredits > 0 || credits.planType === 'enterprise' : false;
  const isLowCredits = credits ? credits.remainingCredits < 10 && credits.planType !== 'enterprise' : false;
  const creditPercentage = credits 
    ? credits.totalCredits === -1 
      ? 100 
      : Math.round((credits.remainingCredits / credits.totalCredits) * 100)
    : 0;

  return {
    credits,
    transactions,
    isLoading,
    error,
    hasCredits,
    isLowCredits,
    creditPercentage,
    refetch: fetchCredits,
    fetchTransactions,
  };
}

// Export model cost constants for UI display
export const MODEL_COSTS: Record<string, number> = {
  'gemini-flash': 1,
  'gemini-2.0-flash': 1,
  'llama-3.3-70b-versatile': 2,
  'llama-3.1-70b-versatile': 2,
  'gpt-4o': 5,
  'gpt-4o-mini': 3,
  'claude-3-5-sonnet': 5,
  'claude-3-haiku': 2,
  'deepseek-r1': 3,
  'deepseek-chat': 2,
  'default': 1,
};

// Calculate estimated cost for UI display
export function calculateEstimatedCost(
  model: string,
  estimatedPromptTokens = 100,
  estimatedResponseTokens = 500
): number {
  const baseCost = MODEL_COSTS[model] || MODEL_COSTS['default'];
  const tokenCost = (estimatedPromptTokens / 100 * 0.5) + (estimatedResponseTokens / 100 * 0.5);
  return Math.ceil(baseCost + tokenCost);
}
