import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, MessageSquare, Layers, Zap, Copy, Shield, Loader2, LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Icon mapping for CMS icons
const iconMap: Record<string, LucideIcon> = {
  Wand2, MessageSquare, Layers, Zap, Copy, Shield
};

// Emoji to Icon mapping for CMS emoji icons
const emojiToIcon: Record<string, LucideIcon> = {
  "⚡": Zap,
  "✨": Wand2,
  "💬": MessageSquare,
  "📦": Layers,
  "📋": Copy,
  "🛡️": Shield,
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
  {
    id: "1",
    icon: "Wand2",
    title: "Smart Prompt Generation",
    description: "Generate basic or advanced chain-of-thought prompts for any task — optimized for every major AI model.",
    isVisible: true,
  },
  {
    id: "2",
    icon: "MessageSquare",
    title: "AI ChatBox",
    description: "A unique chat interface with conversation history, export options, and real-time streaming responses.",
    isVisible: true,
  },
  {
    id: "3",
    icon: "Layers",
    title: "Template Library",
    description: "20+ curated prompt templates across Marketing, SEO, Coding, Writing, and more. Use or customize.",
    isVisible: true,
  },
  {
    id: "4",
    icon: "Zap",
    title: "Content Generation",
    description: "Generate blog posts, tweets, emails, and ad copy instantly. Copy to clipboard or save to history.",
    isVisible: true,
  },
  {
    id: "5",
    icon: "Copy",
    title: "Multi-Model Support",
    description: "Target prompts for ChatGPT, Claude, Gemini, Midjourney, and more with optimized formatting.",
    isVisible: true,
  },
  {
    id: "6",
    icon: "Shield",
    title: "Credit System",
    description: "Flexible credit-based usage with free tier. Subscribe for more or purchase credits on demand.",
    isVisible: true,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const { data, error } = await supabase
          .from('cms_config')
          .select('data')
          .eq('section', 'features')
          .maybeSingle();

        if (error) throw error;
        if (data?.data?.features) {
          const visibleFeatures = data.data.features.filter((f: Feature) => f.isVisible !== false);
          setFeatures(visibleFeatures.length > 0 ? visibleFeatures : defaultFeatures);
        }
      } catch (err) {
        console.error('Error fetching features:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const getIcon = (iconName: string): LucideIcon => {
    // Check if it's a Lucide icon name
    if (iconMap[iconName]) return iconMap[iconName];
    // Check if it's an emoji
    if (emojiToIcon[iconName]) return emojiToIcon[iconName];
    // Default icon
    return Wand2;
  };

  return (
    <section id="features" className="section-padding">
      <div className="container mx-auto">
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

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.id || feature.title}
                variants={item}
                className="glass-card-hover p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                {feature.badge && (
                  <span className="inline-block mt-3 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {feature.badge}
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
