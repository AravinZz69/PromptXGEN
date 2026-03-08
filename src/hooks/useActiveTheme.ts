/**
 * Hook to get the active theme ID for conditional rendering.
 * Reads from data-theme attribute and listens for changes.
 */
import { useState, useEffect } from 'react';

export type ThemeId = 'cosmos' | 'aurora' | 'lumina' | 'ember' | 'arctic' | 'midnight' | 'sakura' | 'cyberpunk' | 'forest';

export function useActiveTheme(): ThemeId {
  const [theme, setTheme] = useState<ThemeId>(() => {
    return (document.documentElement.getAttribute('data-theme') as ThemeId) || 
           (localStorage.getItem('aje_theme') as ThemeId) || 
           'cosmos';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme') as ThemeId;
      if (t && t !== theme) setTheme(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [theme]);

  return theme;
}
