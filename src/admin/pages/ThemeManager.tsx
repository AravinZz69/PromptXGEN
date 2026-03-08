/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemeManager - Admin Page (Enhanced with 9 unique themes)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Palette, ChevronDown, Loader2, RotateCcw, Save, 
  Sparkles, Eye, Wand2, Paintbrush, Type, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, THEMES, ThemeDefinition } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ─── UNIQUE PREVIEW LAYOUTS ───────────────────────────────

interface PreviewProps {
  preview: { bg: string; accent: string; card: string; text: string };
  hovered: boolean;
}

function CosmosPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="p-3 h-full flex flex-col">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-[50px] transition-opacity" style={{ background: preview.accent, opacity: hovered ? 0.4 : 0.15 }} />
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg mb-3 backdrop-blur-sm" style={{ background: `${preview.card}cc`, borderBottom: `1px solid ${preview.accent}25` }}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md" style={{ background: `linear-gradient(135deg, ${preview.accent}, ${preview.accent}88)` }} />
          <div className="w-12 h-2 rounded-full" style={{ background: preview.text, opacity: 0.7 }} />
        </div>
        <div className="flex gap-1.5">{[1,2,3].map(i => <div key={i} className="w-6 h-1.5 rounded-full" style={{ background: preview.text, opacity: 0.3 }} />)}</div>
      </div>
      <div className="text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-28 h-2.5 mx-auto rounded-full mb-2" style={{ background: `linear-gradient(90deg, ${preview.accent}, ${preview.text}88)` }} />
        <div className="w-36 h-1.5 mx-auto rounded-full mb-3" style={{ background: preview.text, opacity: 0.4 }} />
        <div className="flex gap-2 justify-center">
          {[1,2,3].map(i => (
            <div key={i} className="w-14 h-11 rounded-lg p-1.5" style={{ background: `${preview.card}aa`, border: `1px solid ${preview.accent}15` }}>
              <div className="w-3 h-3 rounded-md mb-1" style={{ background: `${preview.accent}${i===2?'':'66'}` }} />
              <div className="w-8 h-1 rounded-full" style={{ background: preview.text, opacity: 0.4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuroraPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="flex h-full">
      <div className="w-10 h-full flex flex-col items-center py-3 gap-2" style={{ background: preview.card, borderRight: `1px solid ${preview.accent}20` }}>
        <div className="w-5 h-5 rounded" style={{ background: preview.accent, opacity: 0.8 }} />
        {[1,2,3,4].map(i => <div key={i} className="w-4 h-4 rounded" style={{ background: preview.text, opacity: i===1 ? 0.6 : 0.2 }} />)}
      </div>
      <div className="flex-1 p-3">
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded" style={{ background: preview.card }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#ff5f56' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#ffbd2e' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#27c93f' }} />
          <div className="w-12 h-1.5 rounded-full ml-2" style={{ background: preview.text, opacity: 0.3 }} />
        </div>
        {[0.9, 0.6, 0.75, 0.5, 0.8].map((w, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5 px-2">
            <span className="text-[8px] font-mono" style={{ color: preview.text, opacity: 0.3 }}>{i+1}</span>
            <div className="h-1.5 rounded-full" style={{ width: `${w*100}%`, background: i%2===0 ? preview.accent : `${preview.text}40`, opacity: hovered ? 1 : 0.7 }} />
          </div>
        ))}
        <div className="mt-3 px-2 py-1.5 rounded" style={{ background: preview.card, border: `1px solid ${preview.accent}30` }}>
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-mono" style={{ color: preview.accent }}>❯</span>
            <div className="w-16 h-1.5 rounded-full" style={{ background: preview.accent, opacity: 0.5 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LuminaPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="p-3 h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl mb-3" style={{ background: preview.card, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg" style={{ background: preview.accent }} />
          <div className="w-14 h-2 rounded-full" style={{ background: preview.text, opacity: 0.8 }} />
        </div>
        <div className="flex gap-1 rounded-lg p-0.5" style={{ background: `${preview.text}08` }}>
          {[0,1,2].map(i => (
            <div key={i} className="px-2 py-1 rounded-md" style={{ background: i===0 ? preview.accent : 'transparent' }}>
              <div className="w-5 h-1" style={{ background: i===0 ? preview.card : `${preview.text}40` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 flex-1">
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-24 h-2 rounded-full mb-2" style={{ background: preview.text, opacity: 0.8 }} />
          <div className="w-full h-1.5 rounded-full mb-1" style={{ background: preview.text, opacity: 0.3 }} />
          <div className="w-3/4 h-1.5 rounded-full mb-3" style={{ background: preview.text, opacity: 0.2 }} />
          <div className="w-16 h-5 rounded-lg" style={{ background: preview.accent, opacity: hovered ? 1 : 0.9 }} />
        </div>
        <div className="flex-1 rounded-xl p-2" style={{ background: preview.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="w-full h-full rounded-lg" style={{ background: `${preview.accent}15`, border: `1px dashed ${preview.accent}30` }} />
        </div>
      </div>
    </div>
  );
}

function EmberPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="h-full relative">
      <div className="absolute -right-8 -top-8 w-32 h-48 rotate-12 blur-sm opacity-20" style={{ background: `linear-gradient(180deg, ${preview.accent}, transparent)` }} />
      <div className="p-3 h-full flex flex-col relative">
        <div className="px-3 py-1.5 mb-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${preview.accent}` }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(135deg, ${preview.accent}, #ef4444)` }} />
            <div className="w-10 h-2 rounded" style={{ background: preview.text, opacity: 0.8 }} />
          </div>
          <div className="flex gap-2">
            {[1,2,3].map(i => <div key={i} className="w-5 h-1.5 rounded" style={{ background: preview.text, opacity: 0.4 }} />)}
            <div className="w-10 h-4 rounded-sm" style={{ background: preview.accent }} />
          </div>
        </div>
        <div className="flex-1 flex items-center px-2">
          <div className="flex-1">
            <div className="w-20 h-3 rounded mb-1.5" style={{ background: preview.accent }} />
            <div className="w-28 h-3 rounded mb-3" style={{ background: preview.text, opacity: 0.6 }} />
            <div className="flex gap-2">
              <div className="w-14 h-5 rounded" style={{ background: `linear-gradient(135deg, ${preview.accent}, #ef4444)` }} />
              <div className="w-14 h-5 rounded" style={{ background: preview.card, border: `1px solid ${preview.accent}40` }} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {[preview.accent, '#ef4444', `${preview.accent}88`].map((c, i) => (
              <div key={i} className="w-16 h-8 rounded-lg p-1.5 flex items-center gap-1" style={{ background: preview.card, border: `1px solid ${c}30` }}>
                <div className="w-3 h-3 rounded" style={{ background: c, opacity: hovered ? 1 : 0.7 }} />
                <div className="w-6 h-1 rounded" style={{ background: preview.text, opacity: 0.4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArcticPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="p-3 h-full flex flex-col relative">
      <div className="absolute top-6 left-6 w-20 h-20 rounded-full blur-[40px] opacity-30" style={{ background: preview.accent }} />
      <div className="mx-auto px-4 py-1.5 rounded-full mb-4 flex items-center gap-3" style={{ background: `${preview.card}ee`, boxShadow: `0 2px 12px ${preview.accent}15`, border: `1px solid ${preview.accent}20` }}>
        <div className="w-4 h-4 rounded-full" style={{ background: preview.accent }} />
        {[1,2,3].map(i => <div key={i} className="w-6 h-1.5 rounded-full" style={{ background: preview.text, opacity: 0.4 }} />)}
        <div className="w-8 h-4 rounded-full" style={{ background: preview.accent, opacity: 0.8 }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-2.5 rounded-full mb-2" style={{ background: preview.text, opacity: 0.7 }} />
        <div className="w-32 h-1.5 rounded-full mb-4" style={{ background: preview.text, opacity: 0.3 }} />
        <div className="flex gap-2">
          {[1,2].map(i => (
            <div key={i} className="w-20 h-14 rounded-xl p-2" style={{ background: `${preview.card}cc`, border: `1px solid ${preview.accent}20`, boxShadow: `0 4px 12px ${preview.accent}10` }}>
              <div className="w-4 h-4 rounded-lg mb-1" style={{ background: `${preview.accent}${i===1?'':'44'}`, opacity: hovered ? 1 : 0.7 }} />
              <div className="w-12 h-1 rounded" style={{ background: preview.text, opacity: 0.3 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MidnightPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="h-full flex">
      <div className="w-12 h-full py-3 px-2 flex flex-col items-center gap-3" style={{ background: preview.card, borderRight: `1px solid ${preview.accent}20` }}>
        <div className="w-6 h-6 rounded-sm" style={{ background: `linear-gradient(135deg, ${preview.accent}, ${preview.accent}88)` }} />
        <div className="w-full h-px" style={{ background: `${preview.accent}20` }} />
        {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-sm" style={{ background: preview.text, opacity: i===1?0.5:0.15 }} />)}
        <div className="mt-auto w-5 h-5 rounded-full" style={{ background: `${preview.accent}30`, border: `1px solid ${preview.accent}40` }} />
      </div>
      <div className="flex-1 p-3 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="w-20 h-2 rounded" style={{ background: preview.text, opacity: 0.6 }} />
          <div className="flex gap-2">{[1,2].map(i => <div key={i} className="w-6 h-1.5 rounded" style={{ background: preview.text, opacity: 0.3 }} />)}</div>
        </div>
        <div className="flex-1 flex gap-3">
          <div className="flex-1">
            <div className="w-full h-3 rounded mb-1" style={{ background: preview.accent, opacity: hovered ? 1 : 0.8 }} />
            <div className="w-3/4 h-1.5 rounded mb-1" style={{ background: preview.text, opacity: 0.4 }} />
            <div className="w-full h-1 rounded mb-1" style={{ background: preview.text, opacity: 0.2 }} />
            <div className="w-2/3 h-1 rounded mb-3" style={{ background: preview.text, opacity: 0.2 }} />
            <div className="w-14 h-4 rounded-sm" style={{ background: preview.accent, opacity: 0.9 }} />
          </div>
          <div className="w-16 rounded-lg overflow-hidden" style={{ background: `linear-gradient(180deg, ${preview.accent}30, ${preview.card})`, border: `1px solid ${preview.accent}20` }}>
            <div className="w-full h-full" style={{ background: `repeating-linear-gradient(0deg, ${preview.accent}08, ${preview.accent}08 8px, transparent 8px, transparent 16px)` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SakuraPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="p-3 h-full flex flex-col relative">
      <div className="absolute top-2 right-4 w-16 h-16 rounded-full blur-[30px] opacity-30" style={{ background: preview.accent }} />
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full" style={{ background: `linear-gradient(135deg, ${preview.accent}, #f472b6)` }} />
        {[1,2,3].map(i => (
          <div key={i} className="px-2 py-1 rounded-full" style={{ background: i===1 ? `${preview.accent}20` : 'transparent' }}>
            <div className="w-6 h-1.5 rounded-full" style={{ background: preview.text, opacity: i===1 ? 0.7 : 0.3 }} />
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <div className="w-24 h-2 rounded-full mb-1" style={{ background: preview.text, opacity: 0.7 }} />
        <div className="w-32 h-1.5 rounded-full mb-2" style={{ background: preview.text, opacity: 0.3 }} />
        <div className="flex gap-2">
          {[preview.accent, '#f472b6', '#fb923c'].map((c, i) => (
            <div key={i} className="w-16 h-16 rounded-2xl p-2 flex flex-col items-center justify-center gap-1" style={{ background: preview.card, border: `1px solid ${c}25`, boxShadow: hovered ? `0 4px 12px ${c}15` : 'none' }}>
              <div className="w-5 h-5 rounded-xl" style={{ background: c, opacity: 0.6 }} />
              <div className="w-8 h-1 rounded-full" style={{ background: preview.text, opacity: 0.3 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CyberpunkPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${preview.accent}, #00ffff, ${preview.accent})`, opacity: hovered ? 1 : 0.6 }} />
      <div className="absolute bottom-0 right-0 w-24 h-24 blur-[40px] opacity-30" style={{ background: '#00ffff' }} />
      <div className="p-3 h-full flex flex-col relative">
        <div className="flex items-center justify-between px-2 py-1 mb-3" style={{ borderLeft: `2px solid ${preview.accent}`, borderBottom: `1px solid #00ffff30` }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5" style={{ background: preview.accent, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <div className="w-12 h-2 rounded-sm" style={{ background: preview.text, opacity: 0.7 }} />
          </div>
          <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-1 h-4" style={{ background: i===2 ? '#00ffff' : preview.accent, opacity: 0.6 }} />)}</div>
        </div>
        <div className="flex-1 flex gap-2">
          <div className="flex-[2] flex flex-col justify-center">
            <div className="w-full h-2.5 mb-1" style={{ background: `linear-gradient(90deg, ${preview.accent}, #00ffff)`, opacity: 0.8 }} />
            <div className="w-3/4 h-1.5 mb-3" style={{ background: preview.text, opacity: 0.3 }} />
            <div className="w-16 h-5 skew-x-[-5deg]" style={{ background: preview.accent, boxShadow: hovered ? `0 0 15px ${preview.accent}60` : 'none' }} />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {[preview.accent, '#00ffff', `${preview.accent}88`].map((c, i) => (
              <div key={i} className="flex-1 rounded-sm p-1.5" style={{ background: preview.card, borderLeft: `2px solid ${c}`, borderRight: `1px solid ${c}20` }}>
                <div className="w-full h-1 rounded mb-1" style={{ background: c, opacity: 0.5 }} />
                <div className="w-3/4 h-1 rounded" style={{ background: preview.text, opacity: 0.2 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ForestPreview({ preview, hovered }: PreviewProps) {
  return (
    <div className="p-3 h-full flex flex-col relative">
      <div className="absolute bottom-0 left-0 w-full h-16 opacity-20" style={{ background: `linear-gradient(0deg, ${preview.accent}40, transparent)` }} />
      <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl mb-3" style={{ background: preview.card, border: `1px solid ${preview.accent}20` }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ background: preview.accent, opacity: 0.8 }} />
          <div className="w-10 h-2 rounded-full" style={{ background: preview.text, opacity: 0.6 }} />
        </div>
        <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ background: preview.text, opacity: i===1?0.5:0.2 }} />)}</div>
      </div>
      <div className="flex-1 flex gap-2">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-[2] rounded-2xl p-2 flex flex-col justify-end" style={{ background: `linear-gradient(135deg, ${preview.card}, ${preview.accent}15)`, border: `1px solid ${preview.accent}20` }}>
            <div className="w-16 h-2 rounded-full mb-1" style={{ background: preview.text, opacity: 0.6 }} />
            <div className="w-24 h-1.5 rounded-full" style={{ background: preview.text, opacity: 0.3 }} />
          </div>
          <div className="flex-1 rounded-2xl p-2" style={{ background: preview.card, border: `1px solid ${preview.accent}15` }}>
            <div className="w-full h-full rounded-xl" style={{ background: `${preview.accent}15` }} />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 rounded-2xl flex items-center justify-center" style={{ background: `${preview.accent}20`, border: `1px solid ${preview.accent}20` }}>
            <div className="w-6 h-6 rounded-full" style={{ background: preview.accent, opacity: hovered ? 0.8 : 0.5 }} />
          </div>
          <div className="flex-[2] rounded-2xl p-2" style={{ background: preview.card, border: `1px solid ${preview.accent}15` }}>
            <div className="w-8 h-2 rounded-full mb-2" style={{ background: preview.accent, opacity: 0.6 }} />
            {[1,2,3].map(i => <div key={i} className="w-full h-1 rounded-full mb-1" style={{ background: preview.text, opacity: 0.15 }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── THEME PREVIEW CARD ───────────────────────────────────

interface ThemeCardProps {
  theme: ThemeDefinition;
  isActive: boolean;
  onApply: () => void;
  isApplying: boolean;
  index: number;
}

const PREVIEW_MAP: Record<string, React.FC<PreviewProps>> = {
  cosmos: CosmosPreview,
  aurora: AuroraPreview,
  lumina: LuminaPreview,
  ember: EmberPreview,
  arctic: ArcticPreview,
  midnight: MidnightPreview,
  sakura: SakuraPreview,
  cyberpunk: CyberpunkPreview,
  forest: ForestPreview,
};

function ThemePreviewCard({ theme, isActive, onApply, isApplying, index }: ThemeCardProps) {
  const { preview } = theme;
  const [hovered, setHovered] = useState(false);
  const PreviewComponent = PREVIEW_MAP[theme.id] || CosmosPreview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`
        relative rounded-2xl overflow-hidden border-2 transition-all duration-500 group
        ${isActive 
          ? 'border-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]' 
          : 'border-border/50 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.2)]'
        }
      `}
    >
      {isActive && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-emerald-500/30"
        >
          <Check className="w-3 h-3" />
          Active
        </motion.div>
      )}

      <div className="h-48 relative overflow-hidden" style={{ background: preview.bg }}>
        <PreviewComponent preview={preview} hovered={hovered} />
      </div>

      <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-foreground text-base">{theme.name}</h3>
          <div className="flex gap-1 ml-auto">
            {[preview.bg, preview.accent, preview.card, preview.text].map((color, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-border/50 ring-1 ring-black/10" style={{ background: color }} />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{theme.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {theme.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted/80 text-muted-foreground border border-border/50">{tag}</span>
          ))}
        </div>
        <Button
          onClick={onApply}
          disabled={isActive || isApplying}
          className={`w-full transition-all duration-300 ${
            isActive 
              ? 'bg-emerald-600 hover:bg-emerald-600 cursor-default shadow-lg shadow-emerald-600/20' 
              : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
          }`}
        >
          {isApplying ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</>
          ) : isActive ? (
            <><Check className="w-4 h-4 mr-2" />Active Theme</>
          ) : (
            <><Wand2 className="w-4 h-4 mr-2" />Apply Theme</>
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
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout'>('colors');
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

  useEffect(() => {
    const fetchOverrides = async () => {
      const { data } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'theme_overrides')
        .maybeSingle();
      if (data?.data) setOverrides(prev => ({ ...prev, ...data.data }));
    };
    fetchOverrides();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('cms_config')
        .upsert({ section: 'theme_overrides', data: overrides, updated_at: new Date().toISOString() }, { onConflict: 'section' });
      if (error) throw error;
      toast({ title: '✨ Overrides saved', description: 'Your custom theme settings have been applied.' });
    } catch {
      toast({ title: 'Failed to save', description: 'Could not save theme overrides.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
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

  const fontOptions = ['Inter', 'Syne', 'DM Sans', 'Space Mono', 'JetBrains Mono', 'Poppins', 'Fira Code', 'Space Grotesk'];
  const shadowOptions = [
    { value: 'none', label: 'None' },
    { value: 'soft', label: 'Soft' },
    { value: 'medium', label: 'Medium' },
    { value: 'strong', label: 'Strong' },
    { value: 'glow', label: 'Glow' },
  ];
  const tabs = [
    { id: 'colors' as const, label: 'Colors', icon: Paintbrush },
    { id: 'typography' as const, label: 'Typography', icon: Type },
    { id: 'layout' as const, label: 'Layout', icon: Layers },
  ];
  const radiusMap: Record<number, string> = { 0: '0px', 4: '4px', 8: '8px', 12: '12px', 16: '16px', 20: '20px', 24: '24px' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground">Fine-tune: {activeThemeName}</h3>
            <p className="text-sm text-muted-foreground">Customize colors, typography & layout within the selected theme</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-border/50">
              <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-6 mt-4">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <AnimatePresence mode="wait">
                    {activeTab === 'colors' && (
                      <motion.div key="colors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { key: 'primaryColor', label: 'Primary' },
                          { key: 'accentColor', label: 'Accent' },
                          { key: 'backgroundColor', label: 'Background' },
                          { key: 'cardBackground', label: 'Card' },
                          { key: 'textColor', label: 'Text' },
                        ].map(({ key, label }) => (
                          <div key={key} className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
                            <div className="relative flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors">
                              <div className="relative">
                                <input type="color" value={(overrides as any)[key]} onChange={e => setOverrides({ ...overrides, [key]: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                                <div className="absolute inset-0 rounded-lg pointer-events-none ring-2 ring-border/30" style={{ background: (overrides as any)[key] }} />
                              </div>
                              <input type="text" value={(overrides as any)[key]} onChange={e => setOverrides({ ...overrides, [key]: e.target.value })} className="flex-1 bg-transparent text-sm text-foreground font-mono focus:outline-none" />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                    {activeTab === 'typography' && (
                      <motion.div key="typography" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                        {[{ key: 'headingFont', label: 'Heading Font' }, { key: 'bodyFont', label: 'Body Font' }].map(({ key, label }) => (
                          <div key={key} className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
                            <div className="grid grid-cols-4 gap-2">
                              {fontOptions.map(font => (
                                <button key={font} onClick={() => setOverrides({ ...overrides, [key]: font })}
                                  className={`p-3 rounded-xl text-sm border transition-all duration-200 text-left ${(overrides as any)[key] === font ? 'border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10' : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-muted/50'}`}
                                  style={{ fontFamily: font }}
                                >{font}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                    {activeTab === 'layout' && (
                      <motion.div key="layout" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Border Radius</label>
                          <div className="flex gap-2">
                            {[0,4,8,12,16,20,24].map(val => (
                              <button key={val} onClick={() => setOverrides({ ...overrides, borderRadius: val })}
                                className={`flex-1 h-12 border transition-all duration-200 ${overrides.borderRadius === val ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-border/50 bg-muted/30 hover:border-primary/30'}`}
                                style={{ borderRadius: radiusMap[val] }}
                              ><span className="text-xs text-muted-foreground">{val}px</span></button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Shadow</label>
                          <div className="grid grid-cols-5 gap-2">
                            {shadowOptions.map(opt => (
                              <button key={opt.value} onClick={() => setOverrides({ ...overrides, cardShadow: opt.value })}
                                className={`p-3 rounded-xl text-sm border transition-all duration-200 ${overrides.cardShadow === opt.value ? 'border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10' : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30'}`}
                              >{opt.label}</button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5" />Live Preview
                  </div>
                  <div className="rounded-2xl p-5 space-y-4 transition-all duration-500 border"
                    style={{ backgroundColor: overrides.backgroundColor, color: overrides.textColor, borderRadius: `${overrides.borderRadius}px`, borderColor: `${overrides.primaryColor}20` }}>
                    <h3 style={{ fontFamily: overrides.headingFont, color: overrides.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>Preview Heading</h3>
                    <p style={{ fontFamily: overrides.bodyFont, fontSize: '13px', opacity: 0.8 }}>This is how your content looks with the current settings.</p>
                    <div className="inline-block px-3 py-1 text-xs font-medium" style={{ backgroundColor: `${overrides.accentColor}20`, color: overrides.accentColor, borderRadius: `${overrides.borderRadius}px` }}>✨ Badge</div>
                    <div className="p-3 text-xs" style={{ backgroundColor: overrides.cardBackground, borderRadius: `${overrides.borderRadius}px`, border: `1px solid ${overrides.primaryColor}15`, fontFamily: overrides.bodyFont }}>
                      <div className="flex gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ background: overrides.primaryColor }} />
                        <div className="w-6 h-6 rounded-full" style={{ background: overrides.accentColor }} />
                      </div>
                      Card component preview
                    </div>
                    <button className="w-full py-2 text-sm font-medium" style={{ background: `linear-gradient(135deg, ${overrides.primaryColor}, ${overrides.accentColor})`, color: '#ffffff', borderRadius: `${overrides.borderRadius}px` }}>
                      Button Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-5 mt-5 border-t border-border/50">
                <Button variant="outline" onClick={handleReset} className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <RotateCcw className="w-4 h-4 mr-2" />Reset
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Overrides</>}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading themes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Site Themes</h1>
            <p className="text-muted-foreground mt-0.5">Choose from 9 unique visual themes — each with its own UI style, navbar, and layout</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme, index) => (
          <ThemePreviewCard
            key={theme.id}
            theme={theme}
            isActive={activeTheme === theme.id}
            onApply={() => handleApplyTheme(theme.id)}
            isApplying={applyingTheme === theme.id}
            index={index}
          />
        ))}
      </div>

      <FineTuneSection activeThemeName={activeThemeName} />
    </div>
  );
}

export default ThemeManager;