import { Target, Zap } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export const AboutMission = () => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Mission */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:border-primary/40 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We believe that the ability to communicate effectively with AI is the 
                most important skill of the 21st century. Yet, most people struggle to 
                get the results they want from AI tools.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                PromptForge exists to bridge this gap. We're building tools that help 
                anyone—regardless of technical background—to harness the full power 
                of AI through better prompts.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:border-accent/40 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Our Vision
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We envision a world where AI augments human capability rather than 
                replacing it. Where everyone has access to AI-powered assistance 
                that actually understands what they need.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                In this future, prompt engineering isn't a specialized skill—it's 
                intuitive, accessible, and built into every AI interaction. That's 
                the future we're building at PromptForge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
