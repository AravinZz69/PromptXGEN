import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  const onboardingCompleted = user?.user_metadata?.onboarding_completed;
  const isOnboardingPage = location.pathname === '/onboarding';

  // Redirect to onboarding if not completed and not already on onboarding page
  if (!onboardingCompleted && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to dashboard if onboarding is completed and user is on onboarding page
  if (onboardingCompleted && isOnboardingPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
