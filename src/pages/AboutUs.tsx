import { useEffect } from "react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/landing/Footer";
import { 
  AboutHero, 
  AboutMission, 
  AboutTeam, 
  AboutTimeline, 
  AboutValues 
} from "@/components/about";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const AboutUs = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  // CTA Section component
  const CTASection = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

    return (
      <section ref={ref} className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`glass-card rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden transition-all duration-700 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                Ready to Transform Your AI Workflow?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join 500,000+ users who are already creating better prompts with PromptForge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card/50 text-foreground font-medium rounded-lg border border-border/50 hover:bg-card hover:border-primary/40 transition-all"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <MiniNavbar />
      
      {/* Hero */}
      <AboutHero />
      
      {/* Mission & Vision */}
      <AboutMission />
      
      {/* Team */}
      <AboutTeam />
      
      {/* Values */}
      <AboutValues />
      
      {/* Timeline */}
      <AboutTimeline />
      
      {/* CTA */}
      <CTASection />

      <Footer />
    </div>
  );
};

export default AboutUs;
