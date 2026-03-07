/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemeSwitcher Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Compact theme picker for user-facing Settings page.
 * Shows 3 theme options with color swatches.
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'expanded';
  showLabel?: boolean;
}

export function ThemeSwitcher({ variant = 'compact', showLabel = true }: ThemeSwitcherProps) {
  const { activeTheme, setActiveTheme, themes, isLoading } = useTheme();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {showLabel && variant === 'compact' && (
          <>
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-3 w-40 bg-muted/50 rounded mb-4" />
          </>
        )}
        <div className={`flex gap-4 ${variant === 'expanded' ? 'flex-wrap' : ''}`}>
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`bg-muted rounded-lg ${
                variant === 'expanded' ? 'w-32 h-24' : 'w-20 h-20'
              }`} 
            />
          ))}
        </div>
      </div>
    );
  }

  // Expanded variant - larger cards with descriptions
  if (variant === 'expanded') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          const { preview } = theme;

          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTheme(theme.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isActive 
                  ? 'border-primary ring-2 ring-primary/30 shadow-lg' 
                  : 'border-border hover:border-primary/50 hover:shadow-md'
                }
              `}
              style={{ background: preview.bg }}
            >
              {/* Active Checkmark */}
              {isActive && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Color Swatches Row */}
              <div className="flex gap-2 mb-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/30 shadow-sm"
                  style={{ background: preview.bg }}
                  title="Background"
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/30 shadow-sm"
                  style={{ background: preview.accent }}
                  title="Accent"
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/30 shadow-sm"
                  style={{ background: preview.card }}
                  title="Card"
                />
              </div>

              {/* Theme Name */}
              <h4 
                className="font-semibold text-sm mb-1"
                style={{ color: preview.text }}
              >
                {theme.name}
              </h4>

              {/* Theme Description */}
              <p 
                className="text-xs opacity-70"
                style={{ color: preview.text }}
              >
                {theme.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Compact variant - original design

  // Compact variant - original design
  return (
    <div className="space-y-3">
      {showLabel && (
        <>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Site Theme</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Choose your preferred visual style
          </p>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          const { preview } = theme;

          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTheme(theme.id)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${isActive 
                  ? 'border-primary ring-2 ring-primary/30' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              style={{ background: preview.bg }}
            >
              {/* Active Checkmark */}
              {isActive && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              {/* Color Swatches */}
              <div className="flex gap-1.5 mb-2">
                <div 
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ background: preview.bg }}
                  title="Background"
                />
                <div 
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ background: preview.accent }}
                  title="Accent"
                />
                <div 
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ background: preview.card }}
                  title="Card"
                />
              </div>

              {/* Theme Name */}
              <span 
                className="text-xs font-medium"
                style={{ color: preview.text }}
              >
                {theme.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
