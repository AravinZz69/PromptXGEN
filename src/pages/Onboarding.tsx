import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, ArrowRight, Check, Loader2,
  Sparkles, Code, Pencil, Briefcase, GraduationCap,
  Phone, MapPin, User
} from 'lucide-react';

// ── TYPES ────────────────────────────────────────────────────────────────────
interface OnboardingData {
  mobile: string;
  city: string;
  role: string;
  useCase: string;
  experienceLevel: string;
}

// ── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${i + 1 < currentStep 
                ? 'bg-primary text-primary-foreground' 
                : i + 1 === currentStep 
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                  : 'bg-muted text-muted-foreground'
              }
            `}
          >
            {i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-0.5 mx-1 ${i + 1 < currentStep ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── ROLE CARD ────────────────────────────────────────────────────────────────
interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({ icon, title, description, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 text-left transition-all
        ${selected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  );
}

// ── DEFAULT CONFIG ───────────────────────────────────────────────────────────
const defaultRoles = [
  { id: 'developer', title: 'Developer', description: 'Building apps & tools', icon: 'code' },
  { id: 'writer', title: 'Content Writer', description: 'Creating content & copy', icon: 'pencil' },
  { id: 'marketer', title: 'Marketer', description: 'Marketing & growth', icon: 'sparkles' },
  { id: 'business', title: 'Business Owner', description: 'Running a business', icon: 'briefcase' },
  { id: 'student', title: 'Student', description: 'Learning & education', icon: 'graduation' },
];

const defaultUseCases = [
  { id: 'writing', title: 'Content Writing', description: 'Blog posts, articles, social media' },
  { id: 'coding', title: 'Code Generation', description: 'Code snippets, debugging, documentation' },
  { id: 'creative', title: 'Creative Projects', description: 'Stories, scripts, creative writing' },
  { id: 'business', title: 'Business Tasks', description: 'Emails, reports, presentations' },
  { id: 'learning', title: 'Learning', description: 'Research, studying, explanations' },
];

const experienceLevels = [
  { id: 'beginner', title: 'Beginner', description: 'New to AI prompts' },
  { id: 'intermediate', title: 'Intermediate', description: 'Some experience with AI' },
  { id: 'advanced', title: 'Advanced', description: 'Regular AI user' },
];

// ── ICON HELPER ──────────────────────────────────────────────────────────────
function getIcon(iconName: string) {
  switch (iconName) {
    case 'code': return <Code className="w-5 h-5" />;
    case 'pencil': return <Pencil className="w-5 h-5" />;
    case 'sparkles': return <Sparkles className="w-5 h-5" />;
    case 'briefcase': return <Briefcase className="w-5 h-5" />;
    case 'graduation': return <GraduationCap className="w-5 h-5" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
}

// ── MAIN ONBOARDING COMPONENT ────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    mobile: '',
    city: '',
    role: '',
    useCase: '',
    experienceLevel: '',
  });
  const [validationError, setValidationError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, role, use_case, experience_level')
        .eq('user_id', user.id)
        .single();
      
      if (data?.onboarding_completed || (data?.role && data?.use_case && data?.experience_level)) {
        navigate('/dashboard');
      }
    };
    
    checkOnboarding();
  }, [user, navigate]);

  const updateField = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const validateStep1 = () => {
    if (!formData.mobile.trim()) return 'Please enter your mobile number';
    if (!/^\+?[\d\s-]{10,}$/.test(formData.mobile.replace(/\s/g, ''))) return 'Please enter a valid mobile number';
    if (!formData.city.trim()) return 'Please enter your city';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.role) return 'Please select your role';
    if (!formData.useCase) return 'Please select your primary use case';
    if (!formData.experienceLevel) return 'Please select your experience level';
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      setValidationError(error);
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setValidationError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateStep2();
    if (error) {
      setValidationError(error);
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      // Update user profile with onboarding data
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          mobile: formData.mobile,
          city: formData.city,
          role: formData.role,
          use_case: formData.useCase,
          experience_level: formData.experienceLevel,
          onboarding_completed: true,
          is_active: true,
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      // Also update user metadata
      await supabase.auth.updateUser({
        data: {
          mobile: formData.mobile,
          city: formData.city,
          role: formData.role,
          use_case: formData.useCase,
          experience_level: formData.experienceLevel,
        }
      });

      toast({
        title: 'Welcome to AskJai!',
        description: 'Your profile has been set up successfully.',
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Mark onboarding as completed even if skipped
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          onboarding_completed: true,
          is_active: true,
        }, { onConflict: 'user_id' });

      navigate('/dashboard');
    } catch (err) {
      console.error('Skip error:', err);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/askjai-logo.png" alt="AskJai" className="h-10 w-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AskJai
              </span>
            </div>
            <h1 className="text-xl font-bold">Welcome, {user?.user_metadata?.name || user?.email?.split('@')[0]}!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Let's personalize your experience
            </p>
          </div>

          {/* Avatar */}
          {user?.user_metadata?.avatar_url && (
            <div className="flex justify-center mb-6">
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border-2 border-primary/20"
              />
            </div>
          )}

          <StepIndicator currentStep={step} totalSteps={2} />

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Mobile Number
                    </Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={(e) => updateField('mobile', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> City
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Role Selection */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">What's your role?</h2>
                    <div className="grid grid-cols-1 gap-2">
                      {defaultRoles.map((role) => (
                        <RoleCard
                          key={role.id}
                          icon={getIcon(role.icon)}
                          title={role.title}
                          description={role.description}
                          selected={formData.role === role.id}
                          onClick={() => updateField('role', role.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Use Case Selection */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Primary use case?</h2>
                    <div className="grid grid-cols-1 gap-2">
                      {defaultUseCases.map((useCase) => (
                        <button
                          key={useCase.id}
                          type="button"
                          onClick={() => updateField('useCase', useCase.id)}
                          className={`
                            p-3 rounded-lg border text-left transition-all text-sm
                            ${formData.useCase === useCase.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                        >
                          <span className="font-medium">{useCase.title}</span>
                          <span className="text-muted-foreground ml-2">- {useCase.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Experience with AI?</h2>
                    <div className="flex gap-2">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => updateField('experienceLevel', level.id)}
                          className={`
                            flex-1 p-3 rounded-lg border text-center transition-all
                            ${formData.experienceLevel === level.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                        >
                          <span className="font-medium text-sm">{level.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Validation Error */}
            {validationError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm mt-4 text-center"
              >
                {validationError}
              </motion.p>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {step === 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-muted-foreground"
                >
                  Skip
                </Button>
              )}

              {step === 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Complete Setup
                </Button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
