import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// Types for CMS navbar config
interface NavLink {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  isVisible: boolean;
}

interface NavbarConfig {
  logoUrl: string;
  siteName: string;
  tagline: string;
  navLinks: NavLink[];
  ctaText: string;
  ctaUrl: string;
  ctaVisible: boolean;
  ctaStyle: string;
  stickyNavbar: boolean;
  transparentOnHero: boolean;
}

// Default values
const DEFAULT_NAVBAR: NavbarConfig = {
  logoUrl: '',
  siteName: 'AskJai',
  tagline: 'AI Prompt Generator',
  navLinks: [
    { id: '1', label: 'Features', url: '#features', isExternal: false, isVisible: true },
    { id: '2', label: 'How It Works', url: '#how-it-works', isExternal: false, isVisible: true },
    { id: '3', label: 'Templates', url: '#templates', isExternal: false, isVisible: true },
    { id: '4', label: 'Pricing', url: '#pricing', isExternal: false, isVisible: true },
  ],
  ctaText: 'Get Started',
  ctaUrl: '/auth?mode=signup',
  ctaVisible: true,
  ctaStyle: 'primary',
  stickyNavbar: true,
  transparentOnHero: true,
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [config, setConfig] = useState<NavbarConfig>(DEFAULT_NAVBAR);

  useEffect(() => {
    const fetchNavbar = async () => {
      console.log('[Navbar] Fetching CMS config...');
      const { data, error } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'navbar')
        .maybeSingle();

      console.log('[Navbar] Response:', { data, error });
      
      if (!error && data?.data) {
        console.log('[Navbar] Applying config:', data.data);
        setConfig({ ...DEFAULT_NAVBAR, ...data.data });
      } else {
        console.log('[Navbar] Using defaults, error:', error?.message);
      }
    };
    
    fetchNavbar();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('navbar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cms_config',
          filter: 'section=eq.navbar',
        },
        (payload) => {
          console.log('[Navbar] Realtime update received:', payload);
          if (payload.new && (payload.new as any).data) {
            setConfig({ ...DEFAULT_NAVBAR, ...(payload.new as any).data });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter visible nav links
  const visibleLinks = config.navLinks.filter(link => link.isVisible);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.siteName} className="h-8 w-8 rounded-lg" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <span className="font-display text-xl font-bold">{config.siteName}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          {config.ctaVisible && (
            <Button variant="hero" size="sm" asChild>
              <Link to={config.ctaUrl}>{config.ctaText}</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-4 p-4">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
                className="text-sm text-muted-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              {config.ctaVisible && (
                <Button variant="hero" size="sm" className="flex-1" asChild>
                  <Link to={config.ctaUrl}>{config.ctaText}</Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
