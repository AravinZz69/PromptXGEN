import { motion } from "framer-motion";
import { Wand2, MessageSquare, Layers, Zap, Copy, Shield } from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "Smart Prompt Generation",
    description: "Generate basic or advanced chain-of-thought prompts for any task — optimized for every major AI model.",
  },
  {
    icon: MessageSquare,
    title: "AI ChatBox",
    description: "A unique chat interface with conversation history, export options, and real-time streaming responses.",
  },
  {
    icon: Layers,
    title: "Template Library",
    description: "20+ curated prompt templates across Marketing, SEO, Coding, Writing, and more. Use or customize.",
  },
  {
    icon: Zap,
    title: "Content Generation",
    description: "Generate blog posts, tweets, emails, and ad copy instantly. Copy to clipboard or save to history.",
  },
  {
    icon: Copy,
    title: "Multi-Model Support",
    description: "Target prompts for ChatGPT, Claude, Gemini, Midjourney, and more with optimized formatting.",
  },
  {
    icon: Shield,
    title: "Credit System",
    description: "Flexible credit-based usage with free tier. Subscribe for more or purchase credits on demand.",
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
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="glass-card-hover p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
