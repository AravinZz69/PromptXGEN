/**
 * ThemedLogin - 9 unique login page layouts based on active theme.
 * Each wraps the login form in a distinct visual style.
 */
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { Terminal, Crown, Snowflake, Flame, Heart, Zap, Sparkles, Leaf } from "lucide-react";

interface ThemedLoginWrapperProps {
  children: ReactNode;
  siteName?: string;
}

export function ThemedLoginWrapper({ children, siteName = "AskJai" }: ThemedLoginWrapperProps) {
  const theme = useActiveTheme();

  // ── COSMOS: Centered with floating orbs ──
  if (theme === 'cosmos') return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-primary/3 blur-[80px]" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md">
        {children}
      </motion.div>
    </div>
  );

  // ── AURORA: Terminal/matrix style ──
  if (theme === 'aurora') return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-mono">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)/0.1) 2px, hsl(var(--primary)/0.1) 4px)` }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4 px-4">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="text-xs text-muted-foreground ml-2">auth@{siteName.toLowerCase()}:~$</span>
        </div>
        <div className="border border-primary/30 rounded-lg bg-card/80 backdrop-blur-sm">
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── LUMINA: Clean white split layout ──
  if (theme === 'lumina') return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Welcome to {siteName}</h2>
          <p className="text-muted-foreground">Generate powerful AI prompts for your academic and professional needs.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          {children}
        </motion.div>
      </div>
    </div>
  );

  // ── EMBER: Bold split with gradient ──
  if (theme === 'ember') return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-destructive/10 to-background" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center">
            <Flame className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-extrabold text-foreground mb-2">{siteName}</h2>
            <p className="text-muted-foreground text-lg">Ignite your creativity</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {children}
        </motion.div>
      </div>
    </div>
  );

  // ── ARCTIC: Frosted glass centered ──
  if (theme === 'arctic') return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-20 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]" />
      <div className="absolute bottom-20 right-20 w-[250px] h-[250px] rounded-full bg-accent/10 blur-[60px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <Snowflake className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">{siteName}</h1>
        </div>
        <div className="bg-card/70 backdrop-blur-xl rounded-3xl border border-border/50 shadow-xl">
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── MIDNIGHT: Luxury editorial card ──
  if (theme === 'midnight') return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.3) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Crown className="h-8 w-8 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold tracking-wide" style={{ fontVariant: 'small-caps' }}>{siteName}</h1>
          <div className="w-16 h-px bg-primary/40 mx-auto mt-3" />
        </div>
        <div className="border border-primary/20 bg-card/80 rounded-sm">
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── SAKURA: Soft pastel with blobs ──
  if (theme === 'sakura') return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-10 right-10 w-[200px] h-[200px] rounded-full bg-primary/10 blur-[60px]" />
      <div className="absolute bottom-10 left-10 w-[150px] h-[150px] rounded-full bg-accent/10 blur-[50px]" />
      <div className="absolute top-1/2 left-1/4 w-[100px] h-[100px] rounded-full bg-primary/5 blur-[40px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{siteName}</h1>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 shadow-lg">
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── CYBERPUNK: Neon angular ──
  if (theme === 'cyberpunk') return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-mono">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] blur-[80px] opacity-20 bg-accent" />
      <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] blur-[60px] opacity-15 bg-primary" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-8 h-8" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
          </div>
          <span className="text-xl font-bold tracking-[0.3em] uppercase">{siteName}</span>
        </div>
        <div className="border-l-2 border-primary border border-primary/20 bg-card/90 backdrop-blur-sm" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── FOREST: Organic rounded ──
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent" />
      <div className="absolute top-20 right-20 w-[200px] h-[200px] rounded-full bg-primary/10 blur-[60px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
            <Leaf className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{siteName}</h1>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
