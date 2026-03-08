// AI Model Service - Manages AI model configurations from Supabase
import { supabase } from './supabase';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  is_default: boolean;
  available_for_plans: string[];
  input_cost_per_million: number;
  output_cost_per_million: number;
  max_tokens: number;
  api_key_encrypted: string | null;
  tokens_used: number;
  requests_today: number;
  avg_latency_ms: number;
  created_at: string;
  updated_at: string;
}

export interface AIModelConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  provider: string;
}

// Provider API URLs
const PROVIDER_URLS: Record<string, string> = {
  'Groq': 'https://api.groq.com/openai/v1/chat/completions',
  'OpenAI': 'https://api.openai.com/v1/chat/completions',
  'Anthropic': 'https://api.anthropic.com/v1/messages',
  'Google': 'https://generativelanguage.googleapis.com/v1beta/models',
  'Together': 'https://api.together.xyz/v1/chat/completions',
  'Mistral': 'https://api.mistral.ai/v1/chat/completions',
};

// Cache for AI models
let modelsCache: AIModel[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Fetch all AI models from Supabase
 */
export async function getAllAIModels(): Promise<AIModel[]> {
  // Check cache
  if (modelsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return modelsCache;
  }

  try {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;

    modelsCache = data || [];
    cacheTimestamp = Date.now();
    return modelsCache;
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return [];
  }
}

/**
 * Get all enabled AI models
 */
export async function getEnabledAIModels(): Promise<AIModel[]> {
  const models = await getAllAIModels();
  return models.filter(m => m.enabled);
}

/**
 * Get the default AI model configuration
 * Falls back to Groq if no default is set or no models exist
 */
export async function getDefaultAIModelConfig(): Promise<AIModelConfig> {
  try {
    const models = await getEnabledAIModels();
    
    // Find default model
    let defaultModel = models.find(m => m.is_default);
    
    // If no default, use first enabled model
    if (!defaultModel && models.length > 0) {
      defaultModel = models[0];
    }

    // If we have a model with API key, use it
    if (defaultModel && defaultModel.api_key_encrypted) {
      return {
        apiUrl: PROVIDER_URLS[defaultModel.provider] || PROVIDER_URLS['OpenAI'],
        apiKey: defaultModel.api_key_encrypted,
        model: defaultModel.name,
        maxTokens: defaultModel.max_tokens || 4096,
        provider: defaultModel.provider,
      };
    }

    // Fallback to environment variable (Groq)
    return {
      apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
      model: 'llama-3.3-70b-versatile',
      maxTokens: 2048,
      provider: 'Groq',
    };
  } catch (error) {
    console.error('Error getting default AI model config:', error);
    // Fallback
    return {
      apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
      model: 'llama-3.3-70b-versatile',
      maxTokens: 2048,
      provider: 'Groq',
    };
  }
}

/**
 * Get AI model for a specific plan
 */
export async function getAIModelForPlan(planType: string): Promise<AIModelConfig> {
  try {
    const models = await getEnabledAIModels();
    
    // Find model available for this plan
    const availableModel = models.find(m => 
      m.available_for_plans?.includes(planType) || 
      m.available_for_plans?.includes('all')
    );

    if (availableModel && availableModel.api_key_encrypted) {
      return {
        apiUrl: PROVIDER_URLS[availableModel.provider] || PROVIDER_URLS['OpenAI'],
        apiKey: availableModel.api_key_encrypted,
        model: availableModel.name,
        maxTokens: availableModel.max_tokens || 4096,
        provider: availableModel.provider,
      };
    }

    // Fallback to default
    return getDefaultAIModelConfig();
  } catch (error) {
    console.error('Error getting AI model for plan:', error);
    return getDefaultAIModelConfig();
  }
}

/**
 * Clear the models cache (call after admin updates)
 */
export function clearAIModelsCache(): void {
  modelsCache = null;
  cacheTimestamp = 0;
}

/**
 * Save/update an AI model (admin only)
 */
export async function saveAIModel(model: Partial<AIModel> & { id?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    if (model.id) {
      // Update existing
      const { error } = await supabase
        .from('ai_models')
        .update({
          name: model.name,
          provider: model.provider,
          enabled: model.enabled,
          is_default: model.is_default,
          available_for_plans: model.available_for_plans,
          input_cost_per_million: model.input_cost_per_million,
          output_cost_per_million: model.output_cost_per_million,
          max_tokens: model.max_tokens,
          api_key_encrypted: model.api_key_encrypted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', model.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('ai_models')
        .insert({
          name: model.name,
          provider: model.provider,
          enabled: model.enabled ?? true,
          is_default: model.is_default ?? false,
          available_for_plans: model.available_for_plans || ['free', 'pro', 'enterprise'],
          input_cost_per_million: model.input_cost_per_million || 0,
          output_cost_per_million: model.output_cost_per_million || 0,
          max_tokens: model.max_tokens || 4096,
          api_key_encrypted: model.api_key_encrypted,
        });

      if (error) throw error;
    }

    // Clear cache after update
    clearAIModelsCache();
    return { success: true };
  } catch (error: any) {
    console.error('Error saving AI model:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an AI model (admin only)
 */
export async function deleteAIModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', modelId);

    if (error) throw error;

    // Clear cache after delete
    clearAIModelsCache();
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting AI model:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set a model as default (admin only)
 */
export async function setDefaultAIModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First, unset all defaults
    await supabase
      .from('ai_models')
      .update({ is_default: false })
      .neq('id', modelId);

    // Then set the new default
    const { error } = await supabase
      .from('ai_models')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', modelId);

    if (error) throw error;

    // Clear cache
    clearAIModelsCache();
    return { success: true };
  } catch (error: any) {
    console.error('Error setting default AI model:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track model usage (called after each API call)
 */
export async function trackModelUsage(modelId: string, tokensUsed: number, latencyMs: number): Promise<void> {
  try {
    // Get current model data
    const { data: model, error: fetchError } = await supabase
      .from('ai_models')
      .select('tokens_used, requests_today, avg_latency_ms')
      .eq('id', modelId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate new average latency
    const totalRequests = (model?.requests_today || 0) + 1;
    const currentAvg = model?.avg_latency_ms || 0;
    const newAvg = Math.round(((currentAvg * (totalRequests - 1)) + latencyMs) / totalRequests);

    // Update model stats
    const { error } = await supabase
      .from('ai_models')
      .update({
        tokens_used: (model?.tokens_used || 0) + tokensUsed,
        requests_today: totalRequests,
        avg_latency_ms: newAvg,
        updated_at: new Date().toISOString(),
      })
      .eq('id', modelId);

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking model usage:', error);
  }
}
