import { useState } from "react";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export const BlogNewsletter = () => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStatus("success");
    setEmail("");
    
    // Reset after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <section
      ref={ref}
      className="section-padding"
    >
      <div 
        className={`max-w-4xl mx-auto glass-card rounded-2xl p-8 sm:p-12 relative overflow-hidden transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-6">
            <Mail className="w-6 h-6" />
          </div>

          {/* Content */}
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
            Stay Ahead in Prompt Engineering
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get weekly tips, tutorials, and AI insights delivered straight to your inbox. 
            Join 15,000+ prompt engineers who are already subscribed.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50"
            >
              {status === "idle" && (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
              {status === "loading" && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subscribing...
                </>
              )}
              {status === "success" && (
                <>
                  <Check className="w-4 h-4" />
                  Subscribed!
                </>
              )}
            </button>
          </form>

          {/* Privacy note */}
          <p className="text-xs text-muted-foreground mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
