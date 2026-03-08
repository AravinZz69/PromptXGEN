/**
 * ThemedNavbar - 9 unique navbar layouts based on active theme.
 * Each theme gets a distinctly different navigation style.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, Terminal, Leaf, Crown, Snowflake, Flame, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useActiveTheme, ThemeId } from "@/hooks/useActiveTheme";

interface NavLink {
  id: string; label: string; url: string; isExternal: boolean; isVisible: boolean;
}
interface NavbarConfig {
  logoUrl: string; siteName: string; tagline: string; navLinks: NavLink[];
  ctaText: string; ctaUrl: string; ctaVisible: boolean; ctaStyle: string;
  stickyNavbar: boolean; transparentOnHero: boolean;
}

const DEFAULT_NAVBAR: NavbarConfig = {
  logoUrl: '', siteName: 'AskJai', tagline: 'AI Prompt Generator',
  navLinks: [
    { id: '1', label: 'Features', url: '#features', isExternal: false, isVisible: true },
    { id: '2', label: 'Pricing', url: '#pricing', isExternal: false, isVisible: true },
    { id: '3', label: 'Templates', url: '/templates', isExternal: false, isVisible: true },
    { id: '4', label: 'Blogs', url: '/blogs', isExternal: false, isVisible: true },
    { id: '5', label: 'About', url: '/about', isExternal: false, isVisible: true },
    { id: '6', label: 'Contact', url: '/contact', isExternal: false, isVisible: true },
  ],
  ctaText: 'Dashboard', ctaUrl: '/dashboard', ctaVisible: true, ctaStyle: 'primary',
  stickyNavbar: true, transparentOnHero: true,
};

const THEME_ICONS: Record<ThemeId, React.ElementType> = {
  cosmos: Sparkles, aurora: Terminal, lumina: Sparkles, ember: Flame,
  arctic: Snowflake, midnight: Crown, sakura: Heart, cyberpunk: Zap, forest: Leaf,
};

const ThemedNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [config, setConfig] = useState<NavbarConfig>(DEFAULT_NAVBAR);
  const theme = useActiveTheme();

  useEffect(() => {
    const fetchNavbar = async () => {
      const { data, error } = await supabase.from('cms_config').select('data').eq('section', 'navbar').maybeSingle();
      if (!error && data?.data) setConfig({ ...DEFAULT_NAVBAR, ...data.data });
    };
    fetchNavbar();
    const channel = supabase.channel('navbar-changes-themed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cms_config', filter: 'section=eq.navbar' },
        (payload) => { if (payload.new && (payload.new as any).data) setConfig({ ...DEFAULT_NAVBAR, ...(payload.new as any).data }); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const visibleLinks = config.navLinks.filter(l => l.isVisible);
  const LogoIcon = THEME_ICONS[theme];

  const renderLogo = () => (
    <Link to="/" className="flex items-center gap-2">
      {config.logoUrl ? (
        <img src={config.logoUrl} alt={config.siteName} className="h-8 w-8 rounded-lg" />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <LogoIcon className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <span className="font-display text-xl font-bold">{config.siteName}</span>
    </Link>
  );

  const renderNavLink = (link: NavLink, extraClass = "") => (
    <a key={link.id} href={link.url}
      target={link.isExternal ? '_blank' : undefined}
      rel={link.isExternal ? 'noopener noreferrer' : undefined}
      className={`text-sm text-muted-foreground transition-colors hover:text-foreground ${extraClass}`}
    >{link.label}</a>
  );

  const renderCTA = () => (
    <div className="hidden items-center gap-3 md:flex">
      <Button variant="ghost" size="sm" asChild><Link to="/auth">Sign In</Link></Button>
      {config.ctaVisible && <Button size="sm" asChild><Link to={config.ctaUrl}>{config.ctaText}</Link></Button>}
    </div>
  );

  const renderMobileMenu = () => (
    <>
      <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden z-50">
            <div className="flex flex-col gap-4 p-4">
              {visibleLinks.map(l => <a key={l.id} href={l.url} className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>{l.label}</a>)}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" className="flex-1" asChild><Link to="/auth">Sign In</Link></Button>
                {config.ctaVisible && <Button size="sm" className="flex-1" asChild><Link to={config.ctaUrl}>{config.ctaText}</Link></Button>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // ── COSMOS: Standard centered navbar ──
  if (theme === 'cosmos') return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {renderLogo()}
        <div className="hidden items-center gap-8 md:flex">{visibleLinks.map(l => renderNavLink(l))}</div>
        {renderCTA()}
        {renderMobileMenu()}
      </div>
    </motion.nav>
  );

  // ── AURORA: Terminal-style with green accent line ──
  if (theme === 'aurora') return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="container mx-auto flex h-14 items-center justify-between px-4 font-mono">
        <Link to="/" className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-primary">{config.siteName}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">v2.0</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {visibleLinks.map(l => (
            <a key={l.id} href={l.url} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
              <span className="text-primary/50">./</span>{l.label.toLowerCase()}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="font-mono text-xs" asChild><Link to="/auth">login</Link></Button>
          {config.ctaVisible && <Button size="sm" className="font-mono text-xs bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30" asChild>
            <Link to={config.ctaUrl}>&gt; {config.ctaText.toLowerCase()}</Link>
          </Button>}
        </div>
        {renderMobileMenu()}
      </div>
    </motion.nav>
  );

  // ── LUMINA: Clean with pill tabs ──
  if (theme === 'lumina') return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {renderLogo()}
        <div className="hidden md:flex items-center bg-muted/50 rounded-full p-1 gap-0.5">
          {visibleLinks.map(l => (
            <a key={l.id} href={l.url} className="px-4 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-background transition-all">{l.label}</a>
          ))}
        </div>
        {renderCTA()}
        {renderMobileMenu()}
      </div>
    </motion.nav>
  );

  // ── EMBER: Bold with underline accent ──
  if (theme === 'ember') return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-destructive">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">{config.siteName}</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {visibleLinks.map(l => (
            <a key={l.id} href={l.url} className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-destructive group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild><Link to="/auth">Sign In</Link></Button>
          {config.ctaVisible && <Button size="sm" className="bg-gradient-to-r from-primary to-destructive hover:opacity-90 text-primary-foreground" asChild>
            <Link to={config.ctaUrl}>{config.ctaText}</Link>
          </Button>}
        </div>
        {renderMobileMenu()}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.nav>
  );

  // ── ARCTIC: Floating capsule navbar ──
  if (theme === 'arctic') return (
    <motion.nav initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <div className="flex h-14 items-center justify-between px-6 rounded-full bg-card/90 backdrop-blur-xl shadow-lg border border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <Snowflake className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-bold">{config.siteName}</span>
        </Link>
        <div className="hidden items-center gap-5 md:flex">
          {visibleLinks.map(l => (
            <a key={l.id} href={l.url} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="rounded-full" asChild><Link to="/auth">Sign In</Link></Button>
          {config.ctaVisible && <Button size="sm" className="rounded-full" asChild><Link to={config.ctaUrl}>{config.ctaText}</Link></Button>}
        </div>
        {renderMobileMenu()}
      </div>
    </motion.nav>
  );

  // ── MIDNIGHT: Elegant with gold dividers ──
  if (theme === 'midnight') return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-primary" />
          <span className="text-xl font-bold tracking-wide" style={{ fontVariant: 'small-caps' }}>{config.siteName}</span>
        </Link>
        <div className="hidden items-center md:flex">
          {visibleLinks.map((l, i) => (
            <span key={l.id} className="flex items-center">
              {i > 0 && <span className="mx-4 text-primary/30">|</span>}
              <a href={l.url} className="text-sm tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase">{l.label}</a>
            </span>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" className="tracking-wider uppercase text-xs" asChild><Link to="/auth">Sign In</Link></Button>
          {config.ctaVisible && <Button size="sm" className="bg-primary text-primary-foreground tracking-wider uppercase text-xs" asChild>
            <Link to={config.ctaUrl}>{config.ctaText}</Link>
          </Button>}
        </div>
        {renderMobileMenu()}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </motion.nav>
  );

  // ── SAKURA: Soft rounded bubble nav ──
  if (theme === 'sakura') return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">{config.siteName}</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {visibleLinks.map(l => (
            <a key={l.id} href={l.url} className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">{l.label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="rounded-full" asChild><Link to="/auth">Sign In</Link></Button>
          {config.ctaVisible && <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground" asChild>
            <Link to={config.ctaUrl}>{config.ctaText}</Link>
          </Button>}
        </div>
        {renderMobileMenu()}
      </div>
    </motion.nav>
  );

  // ── CYBERPUNK: Neon edge with glitch feel ──
  if (theme === 'cyberpunk') return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
          </div>
          <span className="font-display text-lg font-bold tracking-widest uppercase">{config.siteName}</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map(l => (
            <a key={l.id} href={l.url} className="px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 border-l border-primary/20 transition-all">{l.label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider" asChild><Link to="/auth">Access</Link></Button>
          {config.ctaVisible && <Button size="sm" className="font-mono text-xs uppercase tracking-wider skew-x-[-3deg] bg-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)]" asChild>
            <Link to={config.ctaUrl}>{config.ctaText}</Link>
          </Button>}
        </div>
        {renderMobileMenu()}
      </div>
    </motion.nav>
  );

  // ── FOREST: Organic rounded with leaf accents ──
  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-xl font-bold">{config.siteName}</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex bg-card/50 rounded-2xl p-1 border border-border/50">
          {visibleLinks.map(l => (
            <a key={l.id} href={l.url} className="px-3 py-1.5 rounded-xl text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-all">{l.label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="rounded-xl" asChild><Link to="/auth">Sign In</Link></Button>
          {config.ctaVisible && <Button size="sm" className="rounded-xl" asChild><Link to={config.ctaUrl}>{config.ctaText}</Link></Button>}
        </div>
        {renderMobileMenu()}
      </div>
    </motion.nav>
  );
};

export default ThemedNavbar;
