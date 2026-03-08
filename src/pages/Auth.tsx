import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Zap, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { AnimatedLoginPage } from '@/components/ui/animated-characters-login';
import { ThemedLoginWrapper } from '@/components/auth/ThemedLogin';
import { OnboardingSignupPage } from '@/components/ui/onboarding-signup';
import { adminLogin, getSession } from '@/admin/adminAuth';
import { checkIsAdmin } from '@/lib/adminService';
import { supabase } from '@/lib/supabase';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

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

interface AuthPagesConfig {
  login?: {
    logoUrl?: string;
    siteName?: string;
    heading?: string;
    subheading?: string;
    submitButtonText?: string;
    forgotPasswordText?: string;
    showGoogleLogin?: boolean;
    showGitHubLogin?: boolean;
    googleButtonText?: string;
    githubButtonText?: string;
    orDividerText?: string;
    signupPrompt?: string;
    signupLinkText?: string;
  };
  signup?: {
    heading?: string;
    subheading?: string;
    roles?: Array<{ id: string; title: string; description: string; icon: string }>;
    useCases?: Array<{ id: string; title: string; description: string }>;
    showGoogleLogin?: boolean;
    showGitHubLogin?: boolean;
  };
  forgotPassword?: {
    heading?: string;
    subheading?: string;
    submitButtonText?: string;
    backToLoginText?: string;
    successMessage?: string;
  };
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authConfig, setAuthConfig] = useState<AuthPagesConfig>({});
  
  const { signIn, signUp, signInWithGoogle, signInWithGitHub, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get where user was trying to go (for redirect after login)
  const from = (location.state as { from?: string })?.from || '/dashboard';

  // Fetch auth pages config from CMS + auth_config providers
  useEffect(() => {
    const fetchConfigs = async () => {
      // Fetch CMS auth pages config and auth_config providers in parallel
      const [cmsResult, authProvidersResult] = await Promise.all([
        supabase.from('cms_config').select('data').eq('section', 'auth_pages').maybeSingle(),
        supabase.from('auth_config').select('provider, is_enabled').in('provider', ['google', 'github']),
      ]);

      let config: AuthPagesConfig = {};
      if (!cmsResult.error && cmsResult.data?.data) {
        config = cmsResult.data.data;
      }

      // Override showGoogle/showGitHub from auth_config table (admin-managed)
      if (!authProvidersResult.error && authProvidersResult.data) {
        const googleEnabled = authProvidersResult.data.find(p => p.provider === 'google')?.is_enabled ?? false;
        const githubEnabled = authProvidersResult.data.find(p => p.provider === 'github')?.is_enabled ?? false;
        
        config.login = { ...config.login, showGoogleLogin: googleEnabled, showGitHubLogin: githubEnabled };
        config.signup = { ...config.signup, showGoogleLogin: googleEnabled, showGitHubLogin: githubEnabled };
      }

      setAuthConfig(config);
    };
    fetchConfigs();
  }, []);

  // Redirect if already logged in (user or admin)
  useEffect(() => {
    // Check admin session first
    const adminSession = getSession();
    if (adminSession && adminSession.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    
    // Check Supabase user session
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // ── LOGIN HANDLER ──────────────────────────────────────────────────────────
  const handleLogin = async (emailInput: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Regular user login via Supabase
      const { error } = await signIn(emailInput, password);
      if (error) {
        setError(error.message);
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Check if user is admin — redirect to admin dashboard
        const isAdminUser = await checkIsAdmin();
        if (isAdminUser) {
          // Store admin session locally for quick checks
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', currentUser?.id)
            .single();
          
          if (adminData) {
            localStorage.setItem('appSession', JSON.stringify({
              token: `admin-${Date.now()}`,
              role: adminData.role,
              email: currentUser?.email,
              name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0],
              userId: currentUser?.id,
              loginTime: new Date().toISOString(),
              isAdmin: true,
            }));
          }
          
          toast({
            title: 'Welcome, Admin!',
            description: 'Redirecting to admin dashboard...',
          });
          navigate('/admin/dashboard', { replace: true });
          return;
        }
        
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── SIGNUP HANDLER ─────────────────────────────────────────────────────────
  const handleSignup = async (data: SignupData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Store additional user data in metadata
      const metadata = {
        full_name: data.fullName,
        mobile: data.mobile,
        city: data.city,
        role: data.role,
        use_case: data.useCase,
        experience_level: data.experienceLevel,
      };

      const { error, needsConfirmation } = await signUp(data.email, data.password, data.fullName, metadata);
      
      if (error) {
        setError(error.message);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (needsConfirmation) {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        setMode('signin');
      } else {
        toast({
          title: 'Account created!',
          description: 'Welcome to AskJai!',
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── GOOGLE SIGN IN ─────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      toast({
        title: 'Google sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // ── GITHUB SIGN IN ─────────────────────────────────────────────────────────
  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError('');
    const { error } = await signInWithGitHub();
    if (error) {
      setError(error.message);
      toast({
        title: 'GitHub sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // ── FORGOT PASSWORD HANDLER ────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
        toast({
          title: 'Reset failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset email sent',
          description: 'Check your email for the password reset link.',
        });
        setMode('signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── FORGOT PASSWORD VIEW ───────────────────────────────────────────────────
  if (mode === 'forgot-password') {
    return (
      <ThemedLoginWrapper>
        <div className="p-8">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <img src="/askjai-logo.png" alt="AskJai" className="h-8 w-8" />
            <span className="font-display text-xl font-bold">AskJai</span>
          </Link>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-sm text-muted-foreground">We'll send you a reset link to your email</p>
          </div>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
              </div>
            </div>
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setMode('signin')} className="text-primary hover:underline font-medium inline-flex items-center text-sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to sign in
            </button>
          </div>
        </div>
      </ThemedLoginWrapper>
    );
  }

  // ── SIGNUP VIEW ────────────────────────────────────────────────────────────
  if (mode === 'signup') {
    return (
      <OnboardingSignupPage
        onSwitchToLogin={() => setMode('signin')}
        onSubmit={handleSignup}
        onGoogleSignIn={handleGoogleSignIn}
        onGitHubSignIn={handleGitHubSignIn}
        isLoading={isLoading}
        error={error}
        config={authConfig.signup}
      />
    );
  }

  // ── LOGIN VIEW (DEFAULT) ───────────────────────────────────────────────────
  return (
    <AnimatedLoginPage
      onSwitchToSignup={() => setMode('signup')}
      onForgotPassword={() => setMode('forgot-password')}
      onSubmit={handleLogin}
      onGoogleSignIn={handleGoogleSignIn}
      onGitHubSignIn={handleGitHubSignIn}
      isLoading={isLoading}
      error={error}
      config={authConfig.login}
    />
  );
};

export default Auth;
