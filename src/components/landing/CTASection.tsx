import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-accent/20" />
          <div className="absolute inset-0 border border-border/30 rounded-2xl" />
          
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />

          <div className="relative z-10 py-16 sm:py-20 px-6 sm:px-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 mb-6"
            >
              <Sparkles className="h-7 w-7 text-primary" />
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Ready to <span className="gradient-text">Supercharge</span> Your AI?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
              Join thousands of creators, developers, and marketers using AskJai to craft perfect prompts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="text-base px-8 py-6 group" asChild>
                <Link to="/auth?mode=signup">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6" asChild>
                <Link to="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
