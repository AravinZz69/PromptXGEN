import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id?: string;
  user_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  city?: string;
  role?: string;
  use_case?: string;
  experience_level?: string;
  avatar_url?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAnalytics {
  id?: string;
  user_id: string;
  total_prompts_generated: number;
  total_tokens_used: number;
  total_credits_spent: number;
  prompts_this_month: number;
  prompts_this_week: number;
  favorite_model?: string;
  favorite_prompt_type?: string;
  last_activity_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCredits {
  credits_balance: number;
  total_credits: number;
  used_credits: number;
  plan_type: string;
}

// Get user profile from database
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    return null;
  }
}

// Update user profile in database
export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in updateUserProfile:', error);
    return { success: false, error: error.message };
  }
}

// Create user profile if not exists
export async function createUserProfile(userId: string, profile: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in createUserProfile:', error);
    return { success: false, error: error.message };
  }
}

// Get user analytics
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  try {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user analytics:', error);
      return null;
    }

    // Return default analytics if no data exists
    if (!data) {
      return {
        user_id: userId,
        total_prompts_generated: 0,
        total_tokens_used: 0,
        total_credits_spent: 0,
        prompts_this_month: 0,
        prompts_this_week: 0,
      };
    }

    return data;
  } catch (err) {
    console.error('Error in getUserAnalytics:', err);
    return null;
  }
}

// Get user credits
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits_balance, total_credits, used_credits, plan_type')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user credits:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getUserCredits:', err);
    return null;
  }
}

// Get prompt history statistics
export async function getPromptHistoryStats(userId: string): Promise<{
  totalPrompts: number;
  promptsByType: Record<string, number>;
  promptsByModel: Record<string, number>;
  recentActivity: Array<{ date: string; count: number }>;
}> {
  try {
    // Get all prompt history for user
    const { data: prompts, error } = await supabase
      .from('prompt_history')
      .select('prompt_type, model, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompt history:', error);
      return {
        totalPrompts: 0,
        promptsByType: {},
        promptsByModel: {},
        recentActivity: [],
      };
    }

    // Calculate statistics
    const promptsByType: Record<string, number> = {};
    const promptsByModel: Record<string, number> = {};
    const activityMap: Record<string, number> = {};

    prompts?.forEach((prompt) => {
      // Count by type
      const type = prompt.prompt_type || 'basic';
      promptsByType[type] = (promptsByType[type] || 0) + 1;

      // Count by model
      const model = prompt.model || 'unknown';
      promptsByModel[model] = (promptsByModel[model] || 0) + 1;

      // Count by date (last 30 days)
      const date = new Date(prompt.created_at).toISOString().split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    // Convert activity map to sorted array (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = Object.entries(activityMap)
      .filter(([date]) => new Date(date) >= thirtyDaysAgo)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      totalPrompts: prompts?.length || 0,
      promptsByType,
      promptsByModel,
      recentActivity,
    };
  } catch (err) {
    console.error('Error in getPromptHistoryStats:', err);
    return {
      totalPrompts: 0,
      promptsByType: {},
      promptsByModel: {},
      recentActivity: [],
    };
  }
}

// Get credit transaction history
export async function getCreditTransactions(userId: string, limit: number = 10): Promise<Array<{
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('id, amount, transaction_type, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching credit transactions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getCreditTransactions:', err);
    return [];
  }
}
