import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SignInCard } from '@/components/ui/sign-in-card';
import { MiniNavbar } from '@/components/ui/mini-navbar';

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      const onboardingCompleted = user?.user_metadata?.onboarding_completed;
      if (onboardingCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <MiniNavbar />
      <SignInCard initialMode={initialMode as 'signin' | 'signup'} />
    </div>
  );
};

export default Login;
