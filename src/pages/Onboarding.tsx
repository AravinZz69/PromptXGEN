import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import { 
  GraduationCap, 
  Users, 
  Code, 
  Palette, 
  BookOpen, 
  Briefcase, 
  Music, 
  Camera, 
  Rocket, 
  Brain,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react';

type UserRole = 'student' | 'mentor';

interface Interest {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const interests: Interest[] = [
  { id: 'programming', label: 'Programming', icon: <Code className="h-5 w-5" /> },
  { id: 'design', label: 'Design', icon: <Palette className="h-5 w-5" /> },
  { id: 'writing', label: 'Writing', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'business', label: 'Business', icon: <Briefcase className="h-5 w-5" /> },
  { id: 'music', label: 'Music', icon: <Music className="h-5 w-5" /> },
  { id: 'photography', label: 'Photography', icon: <Camera className="h-5 w-5" /> },
  { id: 'startup', label: 'Startup', icon: <Rocket className="h-5 w-5" /> },
  { id: 'ai_ml', label: 'AI/ML', icon: <Brain className="h-5 w-5" /> },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = async () => {
    if (!role || selectedInterests.length === 0) {
      toast({
        title: 'Please complete all steps',
        description: 'Select your role and at least one interest.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Update user metadata with role and interests
      const { error } = await supabase.auth.updateUser({
        data: {
          role: role,
          interests: selectedInterests,
          onboarding_completed: true,
        }
      });

      if (error) throw error;

      toast({
        title: 'Welcome aboard!',
        description: 'Your profile has been set up successfully.',
      });
      
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast({
        title: 'Setup failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MiniNavbar />
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="relative z-10 w-full max-w-2xl mx-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-card border border-border rounded-2xl p-8"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Prompt Genius!</h1>
                <p className="text-muted-foreground">Let's personalize your experience. Are you a...</p>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setRole('student')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    role === 'student'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-4 rounded-full ${role === 'student' ? 'bg-primary/20' : 'bg-muted'}`}>
                      <GraduationCap className={`h-8 w-8 ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-lg font-semibold ${role === 'student' ? 'text-primary' : 'text-foreground'}`}>
                      Student
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      I'm here to learn and create
                    </span>
                  </div>
                  {role === 'student' && (
                    <div className="mt-3 flex justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setRole('mentor')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    role === 'mentor'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-4 rounded-full ${role === 'mentor' ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Users className={`h-8 w-8 ${role === 'mentor' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-lg font-semibold ${role === 'mentor' ? 'text-primary' : 'text-foreground'}`}>
                      Mentor
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      I'm here to guide and teach
                    </span>
                  </div>
                  {role === 'mentor' && (
                    <div className="mt-3 flex justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              </div>

              {/* Continue Button */}
              <Button
                onClick={() => role && setStep(2)}
                disabled={!role}
                className="w-full h-12 text-base"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-card border border-border rounded-2xl p-8"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">What are your interests?</h1>
                <p className="text-muted-foreground">Select all that apply to personalize your prompts</p>
              </div>

              {/* Interests Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedInterests.includes(interest.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`${selectedInterests.includes(interest.id) ? 'text-primary' : 'text-muted-foreground'}`}>
                        {interest.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        selectedInterests.includes(interest.id) ? 'text-primary' : 'text-foreground'
                      }`}>
                        {interest.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected count */}
              <p className="text-center text-sm text-muted-foreground mb-6">
                {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={selectedInterests.length === 0 || isLoading}
                  className="flex-1 h-12 text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Get Started
                      <Sparkles className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          You can always update these in settings later
        </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
