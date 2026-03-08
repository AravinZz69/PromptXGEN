// Feature Flags Hook - Check feature flags from Supabase in real-time
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  section: string;
  rollout_percentage: number;
  enabled_for_plans: string[];
  created_at: string;
  updated_at: string;
}

// Cache for feature flags
let flagsCache: Map<string, FeatureFlag> = new Map();
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds cache (shorter for real-time feel)

/**
 * Fetch all feature flags from Supabase
 */
export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  // Check cache
  if (flagsCache.size > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return Array.from(flagsCache.values());
  }

  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('section', { ascending: true });

    if (error) throw error;

    // Update cache
    flagsCache.clear();
    (data || []).forEach(flag => {
      flagsCache.set(flag.key, flag);
    });
    cacheTimestamp = Date.now();

    return data || [];
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return [];
  }
}

/**
 * Check if a feature is enabled by key
 */
export async function isFeatureEnabled(key: string, userPlan?: string): Promise<boolean> {
  try {
    // Try cache first
    if (flagsCache.has(key) && Date.now() - cacheTimestamp < CACHE_DURATION) {
      const flag = flagsCache.get(key)!;
      return checkFlagEnabled(flag, userPlan);
    }

    // Fetch fresh
    await fetchFeatureFlags();
    
    const flag = flagsCache.get(key);
    if (!flag) return false;

    return checkFlagEnabled(flag, userPlan);
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return false;
  }
}

/**
 * Check if a flag is enabled based on rollout and plan
 */
function checkFlagEnabled(flag: FeatureFlag, userPlan?: string): boolean {
  // First check if globally enabled
  if (!flag.enabled) return false;

  // Check plan restriction
  if (userPlan && flag.enabled_for_plans?.length > 0) {
    if (!flag.enabled_for_plans.includes(userPlan) && !flag.enabled_for_plans.includes('all')) {
      return false;
    }
  }

  // Check rollout percentage (simple random check)
  if (flag.rollout_percentage < 100) {
    // Use a deterministic hash based on user session for consistent experience
    const sessionId = sessionStorage.getItem('feature_flag_session') || Math.random().toString(36);
    if (!sessionStorage.getItem('feature_flag_session')) {
      sessionStorage.setItem('feature_flag_session', sessionId);
    }
    
    const hash = hashCode(sessionId + flag.key);
    const percentage = Math.abs(hash % 100);
    if (percentage >= flag.rollout_percentage) {
      return false;
    }
  }

  return true;
}

/**
 * Simple hash function for consistent rollout
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Clear feature flags cache (call after admin updates)
 */
export function clearFeatureFlagsCache(): void {
  flagsCache.clear();
  cacheTimestamp = 0;
}

/**
 * React Hook for feature flags
 */
export function useFeatureFlags(userPlan?: string) {
  const [flags, setFlags] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadFlags = useCallback(async () => {
    try {
      setLoading(true);
      const allFlags = await fetchFeatureFlags();
      
      const flagMap = new Map<string, boolean>();
      for (const flag of allFlags) {
        flagMap.set(flag.key, checkFlagEnabled(flag, userPlan));
      }
      
      setFlags(flagMap);
    } catch (error) {
      console.error('Error loading feature flags:', error);
    } finally {
      setLoading(false);
    }
  }, [userPlan]);

  // Initial load
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // Set up real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
        },
        () => {
          // Clear cache and reload on any change
          clearFeatureFlagsCache();
          loadFlags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadFlags]);

  const isEnabled = useCallback((key: string): boolean => {
    return flags.get(key) ?? false;
  }, [flags]);

  const refresh = useCallback(() => {
    clearFeatureFlagsCache();
    loadFlags();
  }, [loadFlags]);

  return {
    flags,
    isEnabled,
    loading,
    refresh,
  };
}

/**
 * Simple synchronous check (uses cache only)
 */
export function isFeatureEnabledSync(key: string): boolean {
  const flag = flagsCache.get(key);
  if (!flag) return false;
  return flag.enabled && flag.rollout_percentage === 100;
}
