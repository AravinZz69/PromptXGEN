import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=callback_failed');
        return;
      }

      if (data.session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, role, use_case, experience_level')
          .eq('user_id', data.session.user.id)
          .single();

        // If profile exists and has role/use_case/experience_level OR onboarding_completed is true
        const hasCompletedOnboarding = profile?.onboarding_completed || 
          (profile?.role && profile?.use_case && profile?.experience_level);

        if (hasCompletedOnboarding) {
          navigate('/dashboard');
        } else {
          // Redirect to onboarding for OAuth users
          navigate('/onboarding');
        }
      } else {
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
