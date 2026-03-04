"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Eye, EyeOff, Mail, Zap, Github, Loader2, 
  User, Phone, MapPin, ArrowLeft, ArrowRight, Check,
  Sparkles, Code, Pencil, Briefcase, GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── TYPES ────────────────────────────────────────────────────────────────────
interface SignupData {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  password: string;
  confirmPassword: string;
  role: string;
  useCase: string;
  experienceLevel: string;
}

interface OnboardingSignupProps {
  onSwitchToLogin: () => void;
  onSubmit: (data: SignupData) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onGitHubSignIn: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
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

// ── MAIN SIGNUP COMPONENT ────────────────────────────────────────────────────
export function OnboardingSignupPage({
  onSwitchToLogin,
  onSubmit,
  onGoogleSignIn,
  onGitHubSignIn,
  isLoading = false,
  error = "",
}: OnboardingSignupProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    fullName: "",
    email: "",
    mobile: "",
    city: "",
    password: "",
    confirmPassword: "",
    role: "",
    useCase: "",
    experienceLevel: "",
  });
  const [validationError, setValidationError] = useState("");

  const updateField = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError("");
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) return "Please enter your full name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Please enter a valid email";
    if (!formData.mobile.trim()) return "Please enter your mobile number";
    if (!/^\+?[\d\s-]{10,}$/.test(formData.mobile.replace(/\s/g, ''))) return "Please enter a valid mobile number";
    if (!formData.city.trim()) return "Please enter your city";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.password) return "Please enter a password";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const validateStep3 = () => {
    if (!formData.role) return "Please select your role";
    if (!formData.useCase) return "Please select your primary use case";
    if (!formData.experienceLevel) return "Please select your experience level";
    return null;
  };

  const handleNext = () => {
    let error = null;
    if (step === 1) error = validateStep1();
    if (step === 2) error = validateStep2();
    
    if (error) {
      setValidationError(error);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setValidationError("");
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateStep3();
    if (error) {
      setValidationError(error);
      return;
    }
    await onSubmit(formData);
  };

  const roles = [
    { id: "developer", icon: <Code className="w-5 h-5" />, title: "Developer", description: "Building apps & software" },
    { id: "writer", icon: <Pencil className="w-5 h-5" />, title: "Writer / Content Creator", description: "Creating articles & content" },
    { id: "marketer", icon: <Briefcase className="w-5 h-5" />, title: "Marketer", description: "Marketing & campaigns" },
    { id: "student", icon: <GraduationCap className="w-5 h-5" />, title: "Student", description: "Learning & research" },
    { id: "other", icon: <Sparkles className="w-5 h-5" />, title: "Other", description: "Something else entirely" },
  ];

  const useCases = [
    { id: "coding", title: "Code Generation", description: "Write code faster" },
    { id: "writing", title: "Content Writing", description: "Blog posts, articles" },
    { id: "images", title: "Image Generation", description: "Create AI artwork" },
    { id: "analysis", title: "Data Analysis", description: "Research & insights" },
    { id: "learning", title: "Learning", description: "Study & explore" },
  ];

  const experienceLevels = [
    { id: "beginner", title: "Beginner", description: "New to AI tools" },
    { id: "intermediate", title: "Intermediate", description: "Some experience" },
    { id: "advanced", title: "Advanced", description: "Power user" },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Section - Branding */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <img src="/askjai-logo.png" alt="AskJai" className="size-8" />
            <span>AskJai</span>
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center">
          <div className="max-w-md text-center">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
                    <User className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Let's get to know you</h2>
                  <p className="text-primary-foreground/70">Tell us a bit about yourself so we can personalize your experience.</p>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
                    <Eye className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Secure your account</h2>
                  <p className="text-primary-foreground/70">Create a strong password to keep your prompts and data safe.</p>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Almost there!</h2>
                  <p className="text-primary-foreground/70">Help us customize your experience with a few quick questions.</p>
                </>
              )}
            </motion.div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
          <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Right Section - Form */}
      <div className="flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-8">
            <img src="/askjai-logo.png" alt="AskJai" className="size-8" />
            <span>AskJai</span>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Create your account</h1>
            <p className="text-muted-foreground text-sm">
              {step === 1 && "Enter your basic information"}
              {step === 2 && "Set up your password"}
              {step === 3 && "Tell us about yourself"}
            </p>
          </div>

          <StepIndicator currentStep={step} totalSteps={3} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        className="h-12 pl-10 bg-background border-border/60 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="h-12 pl-10 bg-background border-border/60 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.mobile}
                        onChange={(e) => updateField("mobile", e.target.value)}
                        className="h-12 pl-10 bg-background border-border/60 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className="h-12 pl-10 bg-background border-border/60 focus:border-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Password */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Onboarding Questions */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">What best describes you?</Label>
                    <div className="grid gap-2">
                      {roles.map((role) => (
                        <RoleCard
                          key={role.id}
                          icon={role.icon}
                          title={role.title}
                          description={role.description}
                          selected={formData.role === role.id}
                          onClick={() => updateField("role", role.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Use Case */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Primary use case?</Label>
                    <div className="flex flex-wrap gap-2">
                      {useCases.map((useCase) => (
                        <button
                          key={useCase.id}
                          type="button"
                          onClick={() => updateField("useCase", useCase.id)}
                          className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${formData.useCase === useCase.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }
                          `}
                        >
                          {useCase.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Experience with AI tools?</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => updateField("experienceLevel", level.id)}
                          className={`
                            p-3 rounded-xl border-2 text-center transition-all
                            ${formData.experienceLevel === level.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                        >
                          <span className="block font-medium text-sm">{level.title}</span>
                          <span className="block text-xs text-muted-foreground mt-0.5">{level.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Validation Error */}
            {(validationError || error) && (
              <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg">
                {validationError || error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12"
                  disabled={isLoading}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Social Sign Up (only on step 1) */}
          {step === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12 bg-background border-border/60 hover:bg-accent"
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 bg-background border-border/60 hover:bg-accent"
                  type="button"
                  onClick={onGitHubSignIn}
                  disabled={isLoading}
                >
                  <Github className="mr-2 size-5" />
                  GitHub
                </Button>
              </div>
            </>
          )}

          {/* Login Link */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingSignupPage;
