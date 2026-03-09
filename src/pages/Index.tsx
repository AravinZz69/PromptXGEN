import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TemplatesSection from "@/components/landing/TemplatesSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle OAuth callback tokens in URL hash (when redirected to root instead of /auth/callback)
  useEffect(() => {
    const hash = location.hash;
    
    // Check if this is an OAuth callback with access_token in the hash
    if (hash && hash.includes('access_token=')) {
      // Supabase will automatically process the token from the URL due to detectSessionInUrl: true
      // We just need to check for the session and redirect
      const handleOAuthCallback = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/auth?error=callback_failed');
          return;
        }
        
        if (session) {
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Check if user has completed onboarding
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed, role, use_case, experience_level')
            .eq('user_id', session.user.id)
            .single();

          const hasCompletedOnboarding = profile?.onboarding_completed || 
            (profile?.role && profile?.use_case && profile?.experience_level);

          if (hasCompletedOnboarding) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }
      };
      
      handleOAuthCallback();
      return; // Don't process hash as element selector
    }
    
    // Normal hash handling for scrolling to sections
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <MiniNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TemplatesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
