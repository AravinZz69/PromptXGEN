import { motion } from "framer-motion";
import { PenLine, Cpu, Sparkles } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Describe Your Goal",
    description: "Tell us what you want to achieve — a blog post, a code review, a marketing email, or anything else.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Generates Your Prompt",
    description: "Our engine crafts a perfectly structured prompt — choose basic or advanced chain-of-thought format.",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Use & Iterate",
    description: "Copy your prompt, use it with any AI model, save it to your library, or regenerate for a fresh take.",
    color: "from-primary/20 to-accent/10",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-2 block">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Three Steps to <span className="gradient-text">Perfect Prompts</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px border-t border-dashed border-primary/20" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} mb-6 border border-border/30 relative`}
              >
                <step.icon className="h-8 w-8 text-primary" />
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{step.step}</span>
                </div>
              </motion.div>
              <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
