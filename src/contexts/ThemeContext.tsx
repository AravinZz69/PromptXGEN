/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemeContext
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Site-wide theme system with 3 complete visual themes.
 * Admin selects theme → stored in cms_config → applied globally.
 * Also supports fine-tune color overrides within each theme.
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── THEME DEFINITIONS ───────────────────────────────────

export interface ThemePreview {
  bg: string;
  accent: string;
  card: string;
  text: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: ThemePreview;
  tags: string[];
}

// The 9 complete visual themes
export const THEMES: ThemeDefinition[] = [
  {
    id: 'cosmos',
    name: 'Cosmos',
    description: 'Dark space with indigo nebula accents and deep blue cards',
    preview: { bg: '#05060f', accent: '#6366f1', card: '#131629', text: '#e2e8f0' },
    tags: ['Dark', 'Default'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Pure black with neon green glow — hacker vibes',
    preview: { bg: '#000000', accent: '#00ff90', card: '#111111', text: '#e0ffe0' },
    tags: ['Dark', 'Neon', 'Hacker'],
  },
  {
    id: 'lumina',
    name: 'Lumina',
    description: 'Clean light with violet accents for professional SaaS',
    preview: { bg: '#f8fafc', accent: '#7c3aed', card: '#ffffff', text: '#0f172a' },
    tags: ['Light', 'SaaS', 'Professional'],
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm charcoal base with fiery orange-red gradients',
    preview: { bg: '#1a1110', accent: '#f97316', card: '#261c1a', text: '#fde8d8' },
    tags: ['Dark', 'Warm', 'Bold'],
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Icy cool blues on frosted glass surfaces',
    preview: { bg: '#f0f7ff', accent: '#0ea5e9', card: '#e0efff', text: '#0c2d48' },
    tags: ['Light', 'Cool', 'Minimal'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep navy with gold luxury accents and serif elegance',
    preview: { bg: '#0a0e1a', accent: '#f5b942', card: '#141a2e', text: '#e8dcc8' },
    tags: ['Dark', 'Luxury', 'Editorial'],
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'Soft blush pink with warm rose tones and gentle pastels',
    preview: { bg: '#fff5f7', accent: '#e11d74', card: '#ffe4ec', text: '#3d0c1c' },
    tags: ['Light', 'Soft', 'Playful'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Dark purple-black with electric magenta and cyan neon',
    preview: { bg: '#0d0019', accent: '#ff00ff', card: '#1a0033', text: '#e0d4ff' },
    tags: ['Dark', 'Neon', 'Futuristic'],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Earthy deep greens with warm amber highlights',
    preview: { bg: '#0c1a0f', accent: '#22c55e', card: '#152517', text: '#d4e8d0' },
    tags: ['Dark', 'Nature', 'Organic'],
  },
];

// ─── OVERRIDE CONFIG (fine-tune within theme) ─────────────

interface ThemeOverrides {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  headingFont?: string;
  bodyFont?: string;
  baseFontSize?: string;
  borderRadius?: string;
  darkModeDefault?: boolean;
  showCustomCursor?: boolean;
}

// Default override values (only used when overrides are explicitly set)
const DEFAULT_OVERRIDES: ThemeOverrides = {
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

// ─── CONTEXT TYPE ─────────────────────────────────────────

interface ThemeContextType {
  // Active theme (cosmos | aurora | lumina)
  activeTheme: string;
  setActiveTheme: (themeId: string) => Promise<void>;
  themes: ThemeDefinition[];
  
  // Color overrides (fine-tune)
  overrides: ThemeOverrides;
  
  // State
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── HELPER FUNCTIONS ─────────────────────────────────────

// Convert hex to HSL for shadcn CSS variables
function hexToHSL(hex: string): string {
  if (!hex || typeof hex !== 'string') return '0 0% 50%';
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return '0 0% 50%';

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Map border radius setting to CSS value
function getBorderRadiusValue(setting: string): string {
  const map: Record<string, string> = {
    none: '0', rounded: '0.5rem', 'more-rounded': '1rem', full: '9999px',
  };
  return map[setting] || '0.5rem';
}

// Apply data-theme attribute for main theme switching
function applyThemeAttribute(themeId: string) {
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem('aje_theme', themeId);
  console.log('[Theme] Applied data-theme:', themeId);
}

// Apply color overrides (fine-tune within theme)
function applyOverrides(overrides: ThemeOverrides) {
  const root = document.documentElement;

  if (overrides.primaryColor) {
    const primaryHSL = hexToHSL(overrides.primaryColor);
    root.style.setProperty('--primary', primaryHSL);
    root.style.setProperty('--ring', primaryHSL);
    root.style.setProperty('--glow', primaryHSL);
    root.style.setProperty('--gradient-start', primaryHSL);
    root.style.setProperty('--sidebar-primary', primaryHSL);
  }

  if (overrides.accentColor) {
    const accentHSL = hexToHSL(overrides.accentColor);
    root.style.setProperty('--accent', accentHSL);
    root.style.setProperty('--glow-secondary', accentHSL);
    root.style.setProperty('--gradient-end', accentHSL);
  }

  if (overrides.backgroundColor) {
    root.style.setProperty('--background', hexToHSL(overrides.backgroundColor));
  }

  if (overrides.textColor) {
    root.style.setProperty('--foreground', hexToHSL(overrides.textColor));
  }

  if (overrides.buttonColor) {
    root.style.setProperty('--button-primary', hexToHSL(overrides.buttonColor));
  }

  if (overrides.headingFont) {
    root.style.setProperty('--font-heading', overrides.headingFont);
    root.style.setProperty('--font-display', overrides.headingFont);
  }

  if (overrides.bodyFont) {
    root.style.setProperty('--font-body', overrides.bodyFont);
  }

  if (overrides.baseFontSize) {
    root.style.fontSize = overrides.baseFontSize;
  }

  if (overrides.borderRadius) {
    root.style.setProperty('--radius', getBorderRadiusValue(overrides.borderRadius));
  }

  if (overrides.showCustomCursor !== undefined) {
    document.body.classList.toggle('custom-cursor', overrides.showCustomCursor);
  }

  if (overrides.darkModeDefault !== undefined) {
    document.documentElement.classList.toggle('dark', overrides.darkModeDefault);
  }
}

// ─── PROVIDER ─────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveThemeState] = useState<string>('cosmos');
  const [overrides, setOverrides] = useState<ThemeOverrides>(DEFAULT_OVERRIDES);
  const [isLoading, setIsLoading] = useState(false); // Start with false to avoid blocking

  // Fetch active theme from Supabase
  const fetchActiveTheme = useCallback(async () => {
    try {
      // Apply localStorage theme first for instant display (prevents flash)
      const localTheme = localStorage.getItem('aje_theme');
      if (localTheme && THEMES.find(t => t.id === localTheme)) {
        setActiveThemeState(localTheme);
        applyThemeAttribute(localTheme);
      }

      // Fetch from Supabase (server is source of truth)
      const { data, error } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'active_theme')
        .maybeSingle();

      console.log('[Theme] Supabase raw response:', JSON.stringify(data));

      if (error) {
        console.error('[Theme] Supabase error:', error);
        return;
      }

      if (data?.data) {
        let serverTheme: string | null = null;
        
        // Parse the data - could be string or object
        const themeData = data.data;
        console.log('[Theme] Theme data type:', typeof themeData, themeData);
        
        if (typeof themeData === 'string') {
          serverTheme = themeData;
        } else if (themeData && typeof themeData === 'object') {
          serverTheme = themeData.theme || themeData.activeTheme || null;
        }
        
        console.log('[Theme] Extracted theme:', serverTheme);
        
        // Apply server theme if valid
        if (serverTheme && THEMES.find(t => t.id === serverTheme)) {
          console.log('[Theme] Applying server theme:', serverTheme);
          setActiveThemeState(serverTheme);
          applyThemeAttribute(serverTheme);
          localStorage.setItem('aje_theme', serverTheme);
        } else {
          console.log('[Theme] Invalid or missing server theme, using default cosmos');
        }
      } else {
        console.log('[Theme] No theme data in Supabase');
      }

      // Also fetch color overrides
      const { data: overrideData } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'theme')
        .maybeSingle();

      if (overrideData?.data) {
        const fetchedOverrides = { ...DEFAULT_OVERRIDES, ...overrideData.data };
        setOverrides(fetchedOverrides);
        applyOverrides(fetchedOverrides);
      }
    } catch (err) {
      console.error('Failed to fetch theme:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set active theme (admin action)
  const setActiveTheme = useCallback(async (themeId: string) => {
    // Validate theme exists
    const themeExists = THEMES.find(t => t.id === themeId);
    if (!themeExists) {
      console.error('[Theme] Invalid theme ID:', themeId);
      return;
    }

    // Apply immediately
    setActiveThemeState(themeId);
    applyThemeAttribute(themeId);
    localStorage.setItem('aje_theme', themeId);
    
    console.log('[Theme] Saving to Supabase:', themeId);

    // Save to Supabase - use consistent object format
    try {
      const { error } = await supabase
        .from('cms_config')
        .upsert({
          section: 'active_theme',
          data: { theme: themeId },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'section' });

      if (error) {
        console.error('[Theme] Supabase save error:', error);
        throw error;
      }
      console.log('[Theme] Theme saved successfully:', themeId);
    } catch (err) {
      console.error('[Theme] Failed to save theme:', err);
    }
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    fetchActiveTheme();

    const channel = supabase
      .channel('theme-system-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cms_config',
          filter: 'section=eq.active_theme',
        },
        (payload) => {
          console.log('[Theme] Realtime theme change:', payload);
          if (payload.new && (payload.new as any).data?.theme) {
            const newTheme = (payload.new as any).data.theme;
            setActiveThemeState(newTheme);
            applyThemeAttribute(newTheme);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cms_config',
          filter: 'section=eq.theme',
        },
        (payload) => {
          console.log('[Theme] Realtime override change:', payload);
          if (payload.new && (payload.new as any).data) {
            const newOverrides = { ...DEFAULT_OVERRIDES, ...(payload.new as any).data };
            setOverrides(newOverrides);
            applyOverrides(newOverrides);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveTheme]);

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        setActiveTheme,
        themes: THEMES,
        overrides,
        isLoading,
        refreshTheme: fetchActiveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
