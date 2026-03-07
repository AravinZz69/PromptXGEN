/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemeManager - Admin Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Admin page for selecting site-wide themes.
 * - Section A: Theme selector with live previews
 * - Section B: Fine-tune colors within selected theme
 * 
 * Route: /admin/theme
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, ChevronDown, ChevronUp, Loader2, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, THEMES, ThemeDefinition } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ─── THEME PREVIEW CARD ───────────────────────────────────

interface ThemeCardProps {
  theme: ThemeDefinition;
  isActive: boolean;
  onApply: () => void;
  isApplying: boolean;
}

function ThemePreviewCard({ theme, isActive, onApply, isApplying }: ThemeCardProps) {
  const { preview } = theme;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`
        relative rounded-xl overflow-hidden border-2 transition-all duration-300
        ${isActive 
          ? 'border-green-500 ring-2 ring-green-500/30 shadow-lg shadow-green-500/20' 
          : 'border-border hover:border-indigo-500/50'
        }
      `}
    >
      {/* Active Badge */}
      {isActive && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
          <Check className="w-3 h-3" />
          Active
        </div>
      )}

      {/* Mini Site Preview */}
      <div 
        className="h-40 p-3"
        style={{ background: preview.bg }}
      >
        {/* Fake Navbar */}
        <div 
          className="flex items-center justify-between px-2 py-1.5 rounded-md mb-3"
          style={{ 
            background: `${preview.card}`,
            borderBottom: `1px solid ${preview.accent}30`
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ background: preview.accent }}
            />
            <div 
              className="w-12 h-2 rounded"
              style={{ background: preview.text, opacity: 0.8 }}
            />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="w-6 h-1.5 rounded"
                style={{ background: preview.text, opacity: 0.4 }}
              />
            ))}
          </div>
        </div>

        {/* Fake Hero Area */}
        <div className="text-center mb-3">
          <div 
            className="w-24 h-2 mx-auto rounded mb-1.5"
            style={{ background: preview.text, opacity: 0.9 }}
          />
          <div 
            className="w-32 h-1.5 mx-auto rounded"
            style={{ background: preview.text, opacity: 0.5 }}
          />
        </div>

        {/* Fake Feature Cards */}
        <div className="flex gap-2 justify-center">
          {[1, 2].map((i) => (
            <div 
              key={i}
              className="w-16 h-12 rounded-md p-1.5"
              style={{ 
                background: preview.card,
                border: `1px solid ${preview.accent}20`
              }}
            >
              <div 
                className="w-3 h-3 rounded mb-1"
                style={{ background: preview.accent }}
              />
              <div 
                className="w-10 h-1 rounded"
                style={{ background: preview.text, opacity: 0.5 }}
              />
            </div>
          ))}
        </div>

        {/* Fake CTA Button */}
        <div className="flex justify-center mt-2">
          <div 
            className="px-4 py-1 rounded text-[8px] font-medium"
            style={{ 
              background: preview.accent,
              color: preview.bg
            }}
          >
            Button
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="p-4 bg-muted border-t border-border">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-white">{theme.name}</h3>
          {/* Color Swatches */}
          <div className="flex gap-1 ml-auto">
            <div 
              className="w-4 h-4 rounded-full border border-border"
              style={{ background: preview.bg }}
              title="Background"
            />
            <div 
              className="w-4 h-4 rounded-full border border-border"
              style={{ background: preview.accent }}
              title="Accent"
            />
            <div 
              className="w-4 h-4 rounded-full border border-border"
              style={{ background: preview.card }}
              title="Card"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {theme.tags.map((tag) => (
            <span 
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={onApply}
          disabled={isActive || isApplying}
          className={`w-full ${
            isActive 
              ? 'bg-green-600 hover:bg-green-600 cursor-default' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isApplying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : isActive ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Active Theme
            </>
          ) : (
            'Apply Theme'
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── FINE-TUNE SECTION ────────────────────────────────────

interface FineTuneSectionProps {
  activeThemeName: string;
}

function FineTuneSection({ activeThemeName }: FineTuneSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [overrides, setOverrides] = useState({
    primaryColor: '#6366f1',
    accentColor: '#a78bfa',
    backgroundColor: '#05060f',
    cardBackground: '#131629',
    textColor: '#e2e8f0',
    headingFont: 'Syne',
    bodyFont: 'DM Sans',
    borderRadius: 12,
    cardShadow: 'medium',
  });

  // Fetch existing overrides
  useEffect(() => {
    const fetchOverrides = async () => {
      const { data } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'theme_overrides')
        .maybeSingle();
      
      if (data?.data) {
        setOverrides(prev => ({ ...prev, ...data.data }));
      }
    };
    fetchOverrides();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('cms_config')
        .upsert({
          section: 'theme_overrides',
          data: overrides,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'section' });

      if (error) throw error;

      toast({
        title: 'Overrides saved',
        description: 'Your custom theme settings have been applied.',
      });
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: 'Could not save theme overrides.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to active theme defaults
    const activeTheme = THEMES.find(t => t.name === activeThemeName);
    if (activeTheme) {
      setOverrides({
        primaryColor: activeTheme.preview.accent,
        accentColor: activeTheme.preview.accent,
        backgroundColor: activeTheme.preview.bg,
        cardBackground: activeTheme.preview.card,
        textColor: activeTheme.preview.text,
        headingFont: 'Syne',
        bodyFont: 'DM Sans',
        borderRadius: 12,
        cardShadow: 'medium',
      });
    }
  };

  const fontOptions = [
    'Inter', 'Syne', 'DM Sans', 'Space Mono', 'JetBrains Mono', 
    'Poppins', 'Fira Code', 'Space Grotesk'
  ];

  const shadowOptions = [
    { value: 'none', label: 'None' },
    { value: 'soft', label: 'Soft' },
    { value: 'medium', label: 'Medium' },
    { value: 'strong', label: 'Strong' },
    { value: 'glow', label: 'Glow' },
  ];

  return (
    <div className="bg-muted border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <div className="text-left">
            <h3 className="font-semibold text-white">Fine-tune: {activeThemeName}</h3>
            <p className="text-sm text-muted-foreground">Customize colors within the selected theme</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-6 border-t border-border">
          {/* Color Overrides */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Color Overrides
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'primaryColor', label: 'Primary Accent' },
                { key: 'accentColor', label: 'Secondary Accent' },
                { key: 'backgroundColor', label: 'Background' },
                { key: 'cardBackground', label: 'Card Background' },
                { key: 'textColor', label: 'Text Color' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(overrides as any)[key]}
                      onChange={(e) => setOverrides({ ...overrides, [key]: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={(overrides as any)[key]}
                      onChange={(e) => setOverrides({ ...overrides, [key]: e.target.value })}
                      className="flex-1 bg-muted border border-border rounded px-2 py-1.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Typography
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Heading Font</label>
                <select
                  value={overrides.headingFont}
                  onChange={(e) => setOverrides({ ...overrides, headingFont: e.target.value })}
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Body Font</label>
                <select
                  value={overrides.bodyFont}
                  onChange={(e) => setOverrides({ ...overrides, bodyFont: e.target.value })}
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Borders & Spacing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Borders & Spacing
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">
                  Border Radius: {overrides.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={overrides.borderRadius}
                  onChange={(e) => setOverrides({ ...overrides, borderRadius: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Card Shadow</label>
                <select
                  value={overrides.cardShadow}
                  onChange={(e) => setOverrides({ ...overrides, cardShadow: e.target.value })}
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-white"
                >
                  {shadowOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-border text-muted-foreground hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Overrides
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────

export function ThemeManager() {
  const { activeTheme, setActiveTheme, themes, isLoading } = useTheme();
  const [applyingTheme, setApplyingTheme] = useState<string | null>(null);

  const handleApplyTheme = async (themeId: string) => {
    setApplyingTheme(themeId);
    await setActiveTheme(themeId);
    setApplyingTheme(null);
  };

  const activeThemeName = themes.find(t => t.id === activeTheme)?.name || 'Cosmos';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Section A: Theme Selector */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Themes</h1>
          <p className="text-muted-foreground mt-1">
            Choose the complete visual theme for your entire website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              isActive={activeTheme === theme.id}
              onApply={() => handleApplyTheme(theme.id)}
              isApplying={applyingTheme === theme.id}
            />
          ))}
        </div>
      </div>

      {/* Section B: Fine-tune */}
      <FineTuneSection activeThemeName={activeThemeName} />
    </div>
  );
}

export default ThemeManager;
