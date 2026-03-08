import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  isVisible?: boolean;
}

const defaultPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: "10",
    features: ["10 credits/month", "5 templates", "Basic prompt generation", "Limited ChatBox"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 19,
    yearlyPrice: 190,
    credits: "200",
    features: ["200 credits/month", "All templates", "Advanced prompts", "Full ChatBox", "Priority support"],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 49,
    yearlyPrice: 490,
    credits: "Unlimited",
    features: ["Unlimited credits", "All + custom templates", "Advanced prompts", "Full ChatBox", "Priority support", "Custom integrations"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const PricingSection = () => {
  const [annual, setAnnual] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>(defaultPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data, error } = await supabase
          .from('cms_config')
          .select('data')
          .eq('section', 'pricing')
          .maybeSingle();

        if (error) throw error;
        if (!data) return; // No pricing config yet, use defaults
        if (data?.data?.plans) {
          const transformedPlans: PricingPlan[] = data.data.plans
            .filter((p: any) => p.isVisible !== false)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              monthlyPrice: parseFloat(p.monthlyPrice) || 0,
              yearlyPrice: parseFloat(p.annualPrice) || 0,
              credits: p.description || "",
              features: p.features?.map((f: any) => f.text || f) || [],
              cta: p.ctaText || "Get Started",
              highlighted: p.isPopular || false,
            }));
          if (transformedPlans.length > 0) {
            setPlans(transformedPlans);
          }
        }
      } catch (err) {
        console.error('Error fetching pricing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  return (
    <section id="pricing" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary mb-2 block">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>

          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card p-1 mt-4">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Annual <span className="text-xs opacity-70">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id || plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-6 flex flex-col ${
                plan.highlighted
                  ? "gradient-border glow-effect bg-card"
                  : "glass-card"
              }`}
            >
              <div className="mb-6">
                <h3 className="font-display text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display">
                    ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{annual ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.credits} credits</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "hero" : "hero-outline"}
                className="w-full"
                asChild
              >
                <Link to="/auth?mode=signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
