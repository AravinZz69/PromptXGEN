import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles, Brain, Bot } from "lucide-react";
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

const floatingIcons = [
  { icon: Brain, x: "10%", y: "20%", delay: 0, size: "h-6 w-6" },
  { icon: Bot, x: "85%", y: "15%", delay: 0.5, size: "h-5 w-5" },
  { icon: Sparkles, x: "75%", y: "70%", delay: 1, size: "h-7 w-7" },
  { icon: Zap, x: "15%", y: "75%", delay: 1.5, size: "h-5 w-5" },
];

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
      } finally {
        setLoading(false);
      }
    };

    fetchHeroConfig();
  }, []);

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
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px]"
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 5,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <item.icon className={`${item.size} text-primary/60`} />
        </motion.div>
      ))}

      <div className="container mx-auto relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-3.5 w-3.5" />
            </motion.div>
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
          <Button variant="hero" size="lg" className="text-base px-8 py-6 group" asChild>
            <Link to={config.cta1Url}>
              {config.cta1Label}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex items-center justify-center gap-8 sm:gap-12 mt-12 text-muted-foreground"
        >
          {[
            { value: "10K+", label: "Prompts Generated" },
            { value: "2K+", label: "Active Users" },
            { value: "4.9", label: "User Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Floating prompt preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 glass-card p-6 text-left max-w-2xl mx-auto glow-effect relative"
        >
          <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs text-primary font-medium">
            Live Preview
          </div>
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
