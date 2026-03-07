import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface HeroConfig {
  badge: string;
  headline: string;
  subHeadline: string;
  cta1Label: string;
  cta1Url: string;
  cta2Label: string;
  cta2Url: string;
}

const defaultHeroConfig: HeroConfig = {
  badge: "AI-Powered Prompt Engineering",
  headline: "Craft Perfect Prompts in Seconds",
  subHeadline: "Generate high-quality, structured prompts for ChatGPT, Claude, Gemini, and more. From basic to advanced chain-of-thought — unlock AI's full potential.",
  cta1Label: "Start Generating Free",
  cta1Url: "/auth?mode=signup",
  cta2Label: "See How It Works",
  cta2Url: "#features",
};

const HeroSection = () => {
  const [config, setConfig] = useState<HeroConfig>(defaultHeroConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('cms_config')
          .select('data')
          .eq('section', 'hero')
          .maybeSingle();

        if (error) throw error;
        if (data?.data) {
          setConfig({
            badge: data.data.badge || defaultHeroConfig.badge,
            headline: data.data.headline || defaultHeroConfig.headline,
            subHeadline: data.data.subHeadline || defaultHeroConfig.subHeadline,
            cta1Label: data.data.cta1Label || defaultHeroConfig.cta1Label,
            cta1Url: data.data.cta1Url || defaultHeroConfig.cta1Url,
            cta2Label: data.data.cta2Label || defaultHeroConfig.cta2Label,
            cta2Url: data.data.cta2Url || defaultHeroConfig.cta2Url,
          });
        }
      } catch (err) {
        console.error('Error fetching hero config:', err);
        // Keep default config on error
      } finally {
        setLoading(false);
      }
    };

    fetchHeroConfig();
  }, []);

  // Parse headline to add gradient to text after first space-separated part
  const renderHeadline = () => {
    const parts = config.headline.split(' ');
    if (parts.length <= 2) {
      return config.headline;
    }
    const firstPart = parts.slice(0, -2).join(' ');
    const gradientPart = parts.slice(-2).join(' ');
    return (
      <>
        {firstPart}{" "}
        <span className="gradient-text">{gradientPart}</span>
      </>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center section-padding pt-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
            <Zap className="h-3.5 w-3.5" />
            <span>{config.badge}</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
        >
          {renderHeadline()}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          {config.subHeadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="hero" size="lg" className="text-base px-8 py-6" asChild>
            <Link to={config.cta1Url}>
              {config.cta1Label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" className="text-base px-8 py-6" asChild>
            {config.cta2Url.startsWith('#') ? (
              <a href={config.cta2Url}>{config.cta2Label}</a>
            ) : (
              <Link to={config.cta2Url}>{config.cta2Label}</Link>
            )}
          </Button>
        </motion.div>

        {/* Floating prompt preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 glass-card p-6 text-left max-w-2xl mx-auto glow-effect"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-accent/60" />
            <div className="h-3 w-3 rounded-full bg-primary/60" />
            <span className="ml-2 text-xs text-muted-foreground font-body">prompt-generator</span>
          </div>
          <div className="font-mono text-sm leading-relaxed">
            <span className="text-muted-foreground">{">"}</span>{" "}
            <span className="text-primary">Generate</span>{" "}
            <span className="text-foreground/80">an advanced prompt for</span>{" "}
            <span className="text-accent">"writing a SaaS landing page"</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
