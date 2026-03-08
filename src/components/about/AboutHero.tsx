import { Sparkles } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export const AboutHero = () => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <section 
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Our Story</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
            <span className="text-foreground">Building the Future of </span>
            <span className="gradient-text">AI Interaction</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make AI accessible to everyone by helping people 
            communicate more effectively with AI systems.
          </p>
        </div>
      </div>
    </section>
  );
};
