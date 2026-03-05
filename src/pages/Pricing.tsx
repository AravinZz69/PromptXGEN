import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  ArrowLeft,
  Sparkles,
  Star,
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: '10',
    icon: Zap,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    features: [
      { text: '10 prompts/month', included: true },
      { text: '5 basic templates', included: true },
      { text: 'Basic prompt generation', included: true },
      { text: 'Community support', included: true },
      { text: 'Advanced templates', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom templates', included: false },
    ],
    cta: 'Current Plan',
    highlighted: false,
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for students & educators',
    monthlyPrice: 499,
    yearlyPrice: 4999,
    credits: '200',
    icon: Crown,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    features: [
      { text: '200 prompts/month', included: true },
      { text: 'All 72+ templates', included: true },
      { text: 'Advanced AI prompts', included: true },
      { text: 'Priority email support', included: true },
      { text: 'History & favorites', included: true },
      { text: 'Export to PDF/Word', included: true },
      { text: 'Custom templates', included: false },
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    current: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For institutions & teams',
    monthlyPrice: 1999,
    yearlyPrice: 19999,
    credits: 'Unlimited',
    icon: Building2,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    features: [
      { text: 'Unlimited prompts', included: true },
      { text: 'All templates + custom', included: true },
      { text: 'Advanced AI prompts', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'API access', included: true },
      { text: 'Custom integrations', included: true },
    ],
    cta: 'Contact Sales',
    highlighted: false,
    current: false,
  },
];

const Pricing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [annual, setAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      toast({
        title: 'Already on Free Plan',
        description: 'You are currently on the Free plan.',
      });
      return;
    }

    setSelectedPlan(planId);
    
    // For demo, show coming soon
    toast({
      title: 'Coming Soon!',
      description: `${planId === 'pro' ? 'Pro' : 'Enterprise'} plan payment integration coming soon. Stay tuned!`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole="Free Plan"
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === 'dashboard') navigate('/dashboard');
          else if (id === 'generate') navigate('/generate');
          else if (id === 'generative-ai') navigate('/generative-ai');
          else if (id === 'templates') navigate('/templates');
          else if (id === 'bookmarks') navigate('/templates?bookmarks=true');
          else if (id === 'history') navigate('/history');
          else if (id === 'analytics') navigate('/analytics');
          else if (id === 'profile') navigate('/profile');
          else if (id === 'settings') navigate('/settings');
          else if (id === 'upgrade') navigate('/upgrade');
        }}
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content */}
      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <main className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Choose Your Plan</span>
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Upgrade Your Learning Experience
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get unlimited access to AI-powered prompts for JEE, NEET, UPSC, GATE, and more.
                Prices in INR (₹).
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5 mt-6">
                <button
                  onClick={() => setAnnual(false)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    !annual 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    annual 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Annual
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-card border rounded-2xl p-6 flex flex-col ${
                      plan.highlighted 
                        ? 'border-primary shadow-lg shadow-primary/10 scale-105' 
                        : 'border-border hover:border-primary/50'
                    } transition-all duration-300`}
                  >
                    {/* Popular Badge */}
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="mb-6">
                      <div className={`inline-flex p-3 rounded-xl ${plan.bgColor} mb-4`}>
                        <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          ₹{annual ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">
                          /{annual ? 'year' : 'month'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.credits} prompts{plan.id !== 'enterprise' ? '/month' : ''}
                      </p>
                      {annual && plan.monthlyPrice > 0 && (
                        <p className="text-xs text-green-500 mt-1">
                          Save ₹{(plan.monthlyPrice * 12) - plan.yearlyPrice}/year
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className={`w-full h-12 ${
                        plan.highlighted 
                          ? 'bg-primary hover:bg-primary/90' 
                          : plan.current 
                            ? 'bg-muted text-muted-foreground cursor-default'
                            : ''
                      }`}
                      disabled={plan.current}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* FAQ or Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground text-sm mb-4">
                Trusted by 10,000+ students preparing for competitive exams
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">7-day money back</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Secure payment</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-card border border-border rounded-2xl p-6 text-center"
            >
              <h3 className="font-semibold text-foreground mb-2">Need help choosing?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Contact us for a personalized recommendation or custom enterprise solutions.
              </p>
              <Button variant="outline" onClick={() => window.open('mailto:support@askjai.in', '_blank')}>
                Contact Support
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Pricing;
