import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserMetadata {
  full_name?: string;
  mobile?: string;
  city?: string;
  role?: string;
  use_case?: string;
  experience_level?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, metadata?: UserMetadata) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGitHub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create user profile data (replaces database trigger)
async function ensureUserProfile(user: User) {
  if (!user) return;
  
  try {
    const metadata = user.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User';
    
    // Create profile if not exists - these are fire and forget, don't block login
    await Promise.allSettled([
      supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        avatar_url: metadata.avatar_url || null,
      }, { onConflict: 'id' }),
      
      supabase.from('user_profiles').upsert({
        user_id: user.id,
        email: user.email,
        full_name: fullName,
        avatar_url: metadata.avatar_url || null,
        mobile: metadata.mobile || null,
        city: metadata.city || null,
        role: metadata.role || null,
        use_case: metadata.use_case || null,
        experience_level: metadata.experience_level || null,
        is_active: true,
      }, { onConflict: 'user_id' }),
    ]);
    
    // Create credits if not exists
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (!existingCredits) {
      await Promise.allSettled([
        supabase.from('user_credits').insert({
          user_id: user.id,
          credits_balance: 100,
          total_credits: 100,
          used_credits: 0,
        }),
        
        supabase.from('credit_transactions').insert({
          user_id: user.id,
          amount: 100,
          transaction_type: 'bonus',
          description: 'Welcome bonus - Free signup credits',
        }),
      ]);
    }
  } catch (err) {
    console.warn('Error in ensureUserProfile:', err);
    // Don't throw - allow login to continue even if profile setup fails
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loadingRef.current) {
        console.warn('Auth loading timeout - forcing completion');
        loadingRef.current = false;
        setLoading(false);
      }
    }, 5000);

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Error getting session:', error);
        }
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Run profile setup in background without blocking
            ensureUserProfile(session.user).catch(err => {
              console.warn('Failed to ensure user profile on init:', err);
            });
          }
          
          loadingRef.current = false;
          setLoading(false);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        if (isMounted) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    };
    
    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Run profile setup in background without blocking
          ensureUserProfile(session.user).catch(err => {
            console.warn('Failed to ensure user profile:', err);
          });
        }
        
        loadingRef.current = false;
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, metadata?: UserMetadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || metadata?.full_name,
          mobile: metadata?.mobile,
          city: metadata?.city,
          role: metadata?.role,
          use_case: metadata?.use_case,
          experience_level: metadata?.experience_level,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    // If user is returned and session exists, email confirmation is disabled
    if (data?.user && data?.session) {
      setUser(data.user);
      setSession(data.session);
    }
    
    return { error: error as Error | null, needsConfirmation: !data?.session };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error as Error | null };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
