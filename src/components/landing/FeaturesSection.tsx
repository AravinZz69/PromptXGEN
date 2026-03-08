import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, MessageSquare, Layers, Zap, Copy, Shield, LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

const iconMap: Record<string, LucideIcon> = {
  Wand2, MessageSquare, Layers, Zap, Copy, Shield
};

const emojiToIcon: Record<string, LucideIcon> = {
  "⚡": Zap, "✨": Wand2, "💬": MessageSquare, "📦": Layers, "📋": Copy, "🛡️": Shield,
};

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  isVisible: boolean;
}

const defaultFeatures: Feature[] = [
  { id: "1", icon: "Wand2", title: "Smart Prompt Generation", description: "Generate basic or advanced chain-of-thought prompts for any task — optimized for every major AI model.", isVisible: true },
  { id: "2", icon: "MessageSquare", title: "AI ChatBox", description: "A unique chat interface with conversation history, export options, and real-time streaming responses.", isVisible: true },
  { id: "3", icon: "Layers", title: "Template Library", description: "20+ curated prompt templates across Marketing, SEO, Coding, Writing, and more. Use or customize.", isVisible: true },
  { id: "4", icon: "Zap", title: "Content Generation", description: "Generate blog posts, tweets, emails, and ad copy instantly. Copy to clipboard or save to history.", isVisible: true },
  { id: "5", icon: "Copy", title: "Multi-Model Support", description: "Target prompts for ChatGPT, Claude, Gemini, Midjourney, and more with optimized formatting.", isVisible: true },
  { id: "6", icon: "Shield", title: "Credit System", description: "Flexible credit-based usage with free tier. Subscribe for more or purchase credits on demand.", isVisible: true },
];

const FeaturesSection = () => {
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const { data, error } = await supabase.from('cms_config').select('data').eq('section', 'features').maybeSingle();
        if (error) throw error;
        if (data?.data?.features) {
          const visible = data.data.features.filter((f: Feature) => f.isVisible !== false);
          setFeatures(visible.length > 0 ? visible : defaultFeatures);
        }
      } catch (err) {
        console.error('Error fetching features:', err);
      }
    };
    fetchFeatures();
  }, []);

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || emojiToIcon[iconName] || Wand2;
  };

  return (
    <section id="features" className="section-padding relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-2 block">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Master AI Prompts</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete toolkit for generating, managing, and optimizing prompts for any AI workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.id || feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card-hover p-6 group relative"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  {feature.badge && (
                    <span className="inline-block mt-3 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {feature.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
