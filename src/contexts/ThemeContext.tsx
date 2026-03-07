/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemeContext
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Fetches theme settings from cms_config and applies
 * CSS custom properties to the document root.
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to convert hex to HSL for CSS variables
function hexToHSL(hex: string): string {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('cms_config')
          .select('data')
          .eq('section', 'theme')
          .single();

        if (!error && data?.data) {
          const fetchedTheme = { ...DEFAULT_THEME, ...data.data };
          setTheme(fetchedTheme);
          applyTheme(fetchedTheme);
        }
      } catch (err) {
        console.error('Failed to fetch theme:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Apply theme to CSS variables
  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;

    // Apply color variables (converted to HSL for shadcn compatibility)
    root.style.setProperty('--primary', hexToHSL(themeConfig.primaryColor));
    root.style.setProperty('--accent', hexToHSL(themeConfig.accentColor));
    
    // Apply typography
    root.style.setProperty('--font-heading', themeConfig.headingFont);
    root.style.setProperty('--font-body', themeConfig.bodyFont);
    root.style.setProperty('--font-size-base', themeConfig.baseFontSize);

    // Apply border radius
    root.style.setProperty('--radius', getBorderRadiusValue(themeConfig.borderRadius));

    // Apply button color
    root.style.setProperty('--button-primary', hexToHSL(themeConfig.buttonColor));

    // Custom cursor toggle
    if (themeConfig.showCustomCursor) {
      document.body.classList.add('custom-cursor');
    } else {
      document.body.classList.remove('custom-cursor');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, loading }}>
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
