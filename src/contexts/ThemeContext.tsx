/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemeContext
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Fetches theme settings from cms_config and applies
 * CSS custom properties to the document root.
 * Subscribes to realtime changes for live updates.
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Theme configuration interface matching ThemeManager
interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  headingFont: string;
  bodyFont: string;
  baseFontSize: string;
  borderRadius: string;
  darkModeDefault: boolean;
  showCustomCursor: boolean;
}

// Default theme values
const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#6366f1',
  accentColor: '#a855f7',
  backgroundColor: '#0d0f1f',
  textColor: '#ffffff',
  buttonColor: '#6366f1',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  baseFontSize: '16px',
  borderRadius: 'rounded',
  darkModeDefault: true,
  showCustomCursor: true,
};

interface ThemeContextType {
  theme: ThemeConfig;
  loading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to convert hex to HSL for CSS variables
function hexToHSL(hex: string): string {
  if (!hex || typeof hex !== 'string') return '0 0% 50%';
  
  // Remove the hash if present
  hex = hex.replace(/^#/, '');
  
  // Handle short hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  if (hex.length !== 6) return '0 0% 50%';

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

// Map border radius setting to CSS value
function getBorderRadiusValue(setting: string): string {
  const map: Record<string, string> = {
    none: '0',
    rounded: '0.5rem',
    'more-rounded': '1rem',
    full: '9999px',
  };
  return map[setting] || '0.5rem';
}

// Apply theme to CSS variables
function applyTheme(themeConfig: ThemeConfig) {
  const root = document.documentElement;

  // Apply primary color (used by buttons, links, highlights)
  const primaryHSL = hexToHSL(themeConfig.primaryColor);
  root.style.setProperty('--primary', primaryHSL);
  root.style.setProperty('--primary-foreground', '0 0% 100%');
  root.style.setProperty('--ring', primaryHSL);
  root.style.setProperty('--glow', primaryHSL);
  root.style.setProperty('--gradient-start', primaryHSL);
  root.style.setProperty('--sidebar-primary', primaryHSL);
  
  // Apply accent color (used by badges, highlights)
  const accentHSL = hexToHSL(themeConfig.accentColor);
  root.style.setProperty('--accent', accentHSL);
  root.style.setProperty('--accent-foreground', '0 0% 100%');
  root.style.setProperty('--glow-secondary', accentHSL);
  root.style.setProperty('--gradient-end', accentHSL);
  
  // Apply background color
  const bgHSL = hexToHSL(themeConfig.backgroundColor);
  root.style.setProperty('--background', bgHSL);
  
  // Apply text/foreground color
  const textHSL = hexToHSL(themeConfig.textColor);
  root.style.setProperty('--foreground', textHSL);
  
  // Apply button color (for hero buttons etc)
  const buttonHSL = hexToHSL(themeConfig.buttonColor);
  root.style.setProperty('--button-primary', buttonHSL);
  
  // Apply typography
  root.style.setProperty('--font-heading', themeConfig.headingFont);
  root.style.setProperty('--font-body', themeConfig.bodyFont);
  root.style.setProperty('--font-display', themeConfig.headingFont);
  root.style.fontSize = themeConfig.baseFontSize;

  // Apply border radius
  root.style.setProperty('--radius', getBorderRadiusValue(themeConfig.borderRadius));

  // Custom cursor toggle
  if (themeConfig.showCustomCursor) {
    document.body.classList.add('custom-cursor');
  } else {
    document.body.classList.remove('custom-cursor');
  }
  
  // Dark mode class
  if (themeConfig.darkModeDefault) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  console.log('[Theme] Applied:', themeConfig.primaryColor, themeConfig.accentColor);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  const fetchTheme = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'theme')
        .maybeSingle();

      if (!error && data?.data) {
        const fetchedTheme = { ...DEFAULT_THEME, ...data.data };
        setTheme(fetchedTheme);
        applyTheme(fetchedTheme);
      } else {
        // Apply default theme if no CMS data
        applyTheme(DEFAULT_THEME);
      }
    } catch (err) {
      console.error('Failed to fetch theme:', err);
      applyTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTheme();

    // Subscribe to realtime changes on cms_config for theme section
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cms_config',
          filter: 'section=eq.theme',
        },
        (payload) => {
          console.log('[Theme] Realtime update received:', payload);
          if (payload.new && (payload.new as any).data) {
            const newTheme = { ...DEFAULT_THEME, ...(payload.new as any).data };
            setTheme(newTheme);
            applyTheme(newTheme);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTheme]);

  return (
    <ThemeContext.Provider value={{ theme, loading, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
