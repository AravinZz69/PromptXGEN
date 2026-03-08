/**
 * ThemedDashboard - 9 unique dashboard layout styles based on active theme.
 * Wraps the same data/stats in different visual arrangements.
 */
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Star, FileText, Sparkles, ArrowRight, Wand2, Clock, History,
  LayoutTemplate, ChevronRight, Zap, MessageSquare, Terminal, Crown,
  Snowflake, Flame, Heart, Leaf
} from "lucide-react";

interface DashboardStats {
  userName: string;
  usedCredits: number;
  totalCredits: number;
  remainingCredits: number;
  currentPlan: string;
  bookmarkCount: number;
  totalGenerations: number;
}

interface DashboardContentProps {
  stats: DashboardStats;
  actionCards: ReactNode;
  recentActivity: ReactNode;
  popularTemplates: ReactNode;
  quickActions: ReactNode;
}

export function ThemedDashboardLayout({ stats, actionCards, recentActivity, popularTemplates, quickActions }: DashboardContentProps) {
  const theme = useActiveTheme();
  const navigate = useNavigate();

  const statItems = [
    { label: 'Credits Used', value: `${stats.usedCredits}/${stats.totalCredits}`, icon: TrendingUp, progress: (stats.usedCredits / stats.totalCredits) * 100 },
    { label: 'Favorites', value: stats.bookmarkCount, icon: Star },
    { label: 'Total Generations', value: stats.totalGenerations, icon: FileText },
    { label: 'Current Plan', value: stats.currentPlan, icon: Sparkles },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  // ── COSMOS: Standard cards layout ──
  if (theme === 'cosmos') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {stats.userName}!</h1>
          <p className="text-muted-foreground">Ready to create amazing content?</p>
        </div>
        <Button onClick={() => navigate('/generate')} className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <Wand2 className="h-4 w-4" /> New Generation
        </Button>
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium">{s.label}</p>
              <s.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mb-2">{s.value}</p>
            {s.progress !== undefined && (
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ duration: 0.8 }} />
              </div>
            )}
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── AURORA: Terminal dashboard ──
  if (theme === 'aurora') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 font-mono">
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-primary">
        <Terminal className="h-5 w-5" />
        <span className="text-sm">user@askjai:~$ dashboard --user="{stats.userName}"</span>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((s, i) => (
          <div key={i} className="border border-primary/20 bg-card/50 rounded-sm p-4">
            <p className="text-xs text-primary/60 uppercase mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            {s.progress !== undefined && <div className="w-full h-1 bg-muted mt-2 rounded"><div className="h-full bg-primary rounded" style={{ width: `${s.progress}%` }} /></div>}
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── LUMINA: Clean SaaS grid ──
  if (theme === 'lumina') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Good to see you, {stats.userName}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening today</p>
        </div>
        <Button onClick={() => navigate('/generate')} className="rounded-full gap-2 shadow-md"><Wand2 className="h-4 w-4" /> Generate</Button>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
            <s.icon className="h-5 w-5 text-primary mb-3" />
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── EMBER: Bold hero stats ──
  if (theme === 'ember') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/10 via-destructive/5 to-transparent rounded-2xl p-8 border border-primary/20">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><Flame className="h-6 w-6 text-primary" /><span className="text-sm font-bold uppercase tracking-wider text-primary">Dashboard</span></div>
            <h1 className="text-3xl font-extrabold mb-1">Hey, {stats.userName}!</h1>
            <p className="text-muted-foreground">Your creative engine is ready</p>
          </div>
          <Button onClick={() => navigate('/generate')} className="bg-gradient-to-r from-primary to-destructive text-primary-foreground gap-2"><Wand2 className="h-4 w-4" /> Create</Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statItems.map((s, i) => (
            <div key={i} className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── ARCTIC: Frosted glass bento ──
  if (theme === 'arctic') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="text-center py-4">
        <Snowflake className="h-8 w-8 text-primary mx-auto mb-2" />
        <h1 className="text-3xl font-bold">Welcome, {stats.userName}</h1>
        <p className="text-muted-foreground mt-1">Your workspace at a glance</p>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="bg-card/70 backdrop-blur-xl rounded-2xl p-5 border border-border/50 shadow-sm text-center">
            <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── MIDNIGHT: Luxury editorial ──
  if (theme === 'midnight') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="text-center py-6">
        <Crown className="h-6 w-6 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold tracking-wide" style={{ fontVariant: 'small-caps' }}>Welcome, {stats.userName}</h1>
        <div className="w-16 h-px bg-primary/40 mx-auto mt-3" />
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="bg-card border border-primary/10 rounded-sm p-5">
            <p className="text-xs uppercase tracking-wider text-primary/60 mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-primary">{s.value}</p>
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── SAKURA: Playful card layout ──
  if (theme === 'sakura') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Heart className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Hi {stats.userName}! 💫</h1>
          <p className="text-muted-foreground text-sm">Ready to create something beautiful?</p>
        </div>
        <Button onClick={() => navigate('/generate')} className="ml-auto rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
          <Wand2 className="h-4 w-4" /> Create
        </Button>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="bg-card rounded-3xl p-5 border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3"><s.icon className="h-5 w-5 text-primary" /></div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── CYBERPUNK: Neon matrix grid ──
  if (theme === 'cyberpunk') return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 font-mono">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">System Online</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wider uppercase">{stats.userName}</h1>
        </div>
        <Button onClick={() => navigate('/generate')} className="skew-x-[-3deg] gap-2 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"><Wand2 className="h-4 w-4" /> INIT</Button>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((s, i) => (
          <div key={i} className="border-l-2 border-primary bg-card/50 p-4 border border-primary/15">
            <p className="text-[10px] uppercase tracking-wider text-accent mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-primary">{s.value}</p>
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );

  // ── FOREST: Organic bento ──
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Leaf className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {stats.userName}</h1>
          <p className="text-muted-foreground text-sm">Grow your ideas today</p>
        </div>
        <Button onClick={() => navigate('/generate')} className="ml-auto rounded-xl gap-2"><Wand2 className="h-4 w-4" /> Generate</Button>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border/50">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>
      <motion.div variants={itemVariants}>{actionCards}</motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recentActivity}{popularTemplates}</motion.div>
      <motion.div variants={itemVariants}>{quickActions}</motion.div>
    </motion.div>
  );
}
