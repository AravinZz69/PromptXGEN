import { motion } from "framer-motion";
import { PenLine, Cpu, Sparkles } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Describe Your Goal",
    description: "Tell us what you want to achieve — a blog post, a code review, a marketing email, or anything else.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Generates Your Prompt",
    description: "Our engine crafts a perfectly structured prompt — choose basic or advanced chain-of-thought format.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Use & Iterate",
    description: "Copy your prompt, use it with any AI model, save it to your library, or regenerate for a fresh take.",
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-xs font-bold text-primary/60 tracking-widest mb-2">{step.step}</div>
              <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-16 border-t border-dashed border-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
