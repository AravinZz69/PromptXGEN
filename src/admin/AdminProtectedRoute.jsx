import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getSession, logout } from './adminAuth';
import { checkIsAdmin } from '@/lib/adminService';
import { supabase } from '@/lib/supabase';
import { ShieldOff, ChevronRight, Loader2 } from 'lucide-react';

/**
 * Protected route wrapper for admin pages
 * Auth is purely database-driven via admin_users table:
 * 1. Check localStorage cache (set during adminLogin which already verified DB)
 * 2. Verify Supabase user exists in admin_users table
 */
export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    loading: true,
    isAdmin: false,
    userEmail: null,
    hasAnySession: false
  });
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAuthState({ loading: false, isAdmin: false, userEmail: null, hasAnySession: false });
          return;
        }

        // Check if user is already an admin
        let isDbAdmin = await checkIsAdmin();

        // If not admin, check if admin_users table is empty → auto-promote first user
        if (!isDbAdmin) {
          const { count } = await supabase
            .from('admin_users')
            .select('*', { count: 'exact', head: true });

          if (count === 0) {
            // No admins exist yet — make this user the owner
            const { error: insertError } = await supabase
              .from('admin_users')
              .insert({ user_id: user.id, role: 'owner' });

            if (!insertError) {
              isDbAdmin = true;
              console.log('First admin auto-promoted:', user.email);
            }
          }
        }

        setAuthState({
          loading: false,
          isAdmin: isDbAdmin,
          userEmail: user.email,
          hasAnySession: true
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAuthState({ loading: false, isAdmin: false, userEmail: null, hasAnySession: false });
      }
    }
    
    checkAuth();
  }, []);
  
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  if (!authState.hasAnySession || !authState.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AccessDenied({ userEmail }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
          <ShieldOff className="w-9 h-9 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <span className="text-foreground font-medium">{userEmail}</span> does not have admin privileges. 
            This area is restricted to authorized administrators only.
          </p>
        </div>
        <div className="bg-muted/50 border border-border rounded-xl p-4 text-left space-y-2 text-sm text-muted-foreground">
          <p className="text-foreground font-medium text-xs uppercase tracking-wide mb-3">You can:</p>
          <div className="flex items-center gap-2">
            <ChevronRight size={14} className="text-primary" />
            <span>Go back to your dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={14} className="text-primary" />
            <span>Contact an administrator for access</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 rounded-xl border border-border hover:border-primary/50 text-muted-foreground text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
