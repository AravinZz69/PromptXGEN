/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * useCmsConfig Hook
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Custom hook for reading/writing CMS configuration sections
 * 
 * @usage
 * const { data, loading, error, save, refresh } = useCmsConfig('hero')
 * 
 * @features
 * - Auto-fetches config on mount for the given section
 * - Provides save() function with upsert logic
 * - Shows success/error toast notifications
 * - Handles loading and error states
 * - Optimistic updates for better UX
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage CMS config sections
 * @param {string} section - Section name (e.g., 'hero', 'theme', 'navbar')
 * @returns {Object} { data, loading, error, save, refresh }
 */
export function useCmsConfig(section) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch config data for the section
   */
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: configData, error: fetchError } = await supabase
        .from('cms_config')
        .select('*')
        .eq('section', section)
        .single();

      if (fetchError) {
        // If no record exists yet, return empty object (not an error)
        if (fetchError.code === 'PGRST116') {
          setData({});
          setError(null);
        } else {
          throw fetchError;
        }
      } else {
        setData(configData?.data || {});
      }
    } catch (err) {
      console.error(`Error fetching CMS config for section '${section}':`, err);
      setError(err.message);
      toast({
        title: 'Error loading config',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [section, toast]);

  /**
   * Save (upsert) config data for the section
   */
  const save = useCallback(async (newData) => {
    try {
      setSaving(true);
      setError(null);

      // Optimistic update
      setData(newData);

      const { error: saveError } = await supabase
        .from('cms_config')
        .upsert(
          {
            section,
            data: newData,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'section',
          }
        );

      if (saveError) throw saveError;

      toast({
        title: '✅ Saved successfully',
        description: `${section} configuration has been updated.`,
        variant: 'default',
      });

      // Refresh to get server state
      await fetchConfig();

      return { success: true };
    } catch (err) {
      console.error(`Error saving CMS config for section '${section}':`, err);
      setError(err.message);
      
      // Revert optimistic update on error
      await fetchConfig();

      toast({
        title: '❌ Save failed',
        description: err.message,
        variant: 'destructive',
      });

      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [section, toast, fetchConfig]);

  /**
   * Manually refresh config data
   */
  const refresh = useCallback(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Fetch on mount and when section changes
  useEffect(() => {
    if (section) {
      fetchConfig();
    }
  }, [section, fetchConfig]);

  return {
    data,
    loading,
    error,
    saving,
    save,
    refresh,
  };
}

export default useCmsConfig;
