import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getSession, logout, ADMIN_CREDENTIALS } from './adminAuth';
import { checkIsAdmin } from '@/lib/adminService';
import { supabase } from '@/lib/supabase';
import { ShieldOff, ChevronRight, Loader2 } from 'lucide-react';

/**
 * Protected route wrapper for admin pages
 * Supports THREE admin auth methods:
 * 1. localStorage session (hardcoded admin credentials via login form)
 * 2. Supabase user with admin role in admin_users table
 * 3. Supabase user whose email matches hardcoded admin email
 * 
 * Flow:
 * - Checking auth: Shows loading spinner
 * - No session (neither): Redirects to /auth
 * - Session but not admin: Shows 403 AccessDenied page
 * - Admin (any method): Allows access
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
      // Method 1: Check localStorage admin session (hardcoded credentials)
      const localSession = getSession();
      if (localSession && localSession.role === 'admin') {
        setAuthState({
          loading: false,
          isAdmin: true,
          userEmail: localSession.email,
          hasAnySession: true
        });
        return;
      }
      
      // Method 2 & 3: Check Supabase user
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Method 2: Check if email matches hardcoded admin email
          const isHardcodedAdmin = user.email === ADMIN_CREDENTIALS.email;
          
          // Method 3: Check if user has admin role in admin_users table
          const isDbAdmin = await checkIsAdmin();
          
          setAuthState({
            loading: false,
            isAdmin: isHardcodedAdmin || isDbAdmin,
            userEmail: user.email,
            hasAnySession: true
          });
          return;
        }
      } catch (error) {
        console.error('Error checking Supabase admin status:', error);
      }
      
      // No valid session found
      setAuthState({
        loading: false,
        isAdmin: false,
        userEmail: localSession?.email || null,
        hasAnySession: !!localSession
      });
    }
    
    checkAuth();
  }, []);
  
  // Loading state
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // Case 1: Not logged in at all → redirect to unified login
  if (!authState.hasAnySession) {
    return (
      <Navigate 
        to="/auth" 
        state={{ from: location.pathname, message: 'Please log in to continue.' }} 
        replace 
      />
    );
  }
  
  // Case 2: Logged in but NOT admin → show 403 Access Denied
  if (!authState.isAdmin) {
    return <AccessDenied userEmail={authState.userEmail} />;
  }
  
  // Case 3: Admin → allow access
  return children;
}

/**
 * 403 Access Denied component
 * Shown to logged-in users who don't have admin privileges
 */
function AccessDenied({ userEmail }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        {/* Lock Icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldOff className="w-9 h-9 text-red-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            <span className="text-white font-medium">{userEmail}</span> does not have admin privileges. 
            This area is restricted to authorized administrators only.
          </p>
        </div>

        {/* What the user can do */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 text-sm text-gray-400">
          <p className="text-white font-medium text-xs uppercase tracking-wide mb-3">You can:</p>
          <div className="flex items-center gap-2">
            <ChevronRight size={14} className="text-indigo-400" />
            <span>Go back to your dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={14} className="text-indigo-400" />
            <span>Sign out and log in with admin credentials</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
