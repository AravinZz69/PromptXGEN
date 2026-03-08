// Admin Authentication Helpers
// Database-driven auth: Supabase Auth + admin_users table
// No hardcoded credentials — admin role is determined by admin_users table

import { supabase } from '../lib/supabase';

// Unified session storage key
const SESSION_KEY = "appSession";
const LEGACY_ADMIN_KEY = "adminSession";

/**
 * Login as admin via Supabase Auth, then verify admin role in admin_users table
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ success: boolean, role: string, error?: string }>}
 */
export async function adminLogin(email, password) {
  try {
    // Step 1: Authenticate with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      return { success: false, error: authError?.message || 'Invalid credentials' };
    }

    // Step 2: Check if user exists in admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.user.id)
      .single();

    if (adminError || !adminData) {
      // Not an admin — sign them out of this admin flow
      await supabase.auth.signOut();
      return { success: false, error: 'You do not have admin privileges. Contact your system administrator.' };
    }

    // Step 3: Store session locally for quick checks
    const session = {
      token: data.session?.access_token || `admin-${Date.now()}`,
      role: adminData.role, // 'admin' or 'owner' from DB
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Admin',
      userId: data.user.id,
      loginTime: new Date().toISOString(),
      isAdmin: true,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(LEGACY_ADMIN_KEY);

    return { success: true, role: adminData.role };
  } catch (err) {
    console.error('Admin login error:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Clear all sessions and logout
 */
export async function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_ADMIN_KEY);
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signout error:', err);
  }
}

// Alias for backward compatibility
export const adminLogout = logout;

/**
 * Get current unified session
 * @returns {Object|null} Session object or null if invalid/expired
 */
export function getSession() {
  try {
    // Migrate legacy admin session
    const legacyAdmin = localStorage.getItem(LEGACY_ADMIN_KEY);
    if (legacyAdmin) {
      const parsed = JSON.parse(legacyAdmin);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...parsed, isAdmin: true }));
      localStorage.removeItem(LEGACY_ADMIN_KEY);
    }

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    
    const session = JSON.parse(raw);
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursElapsed = (now - loginTime) / (1000 * 60 * 60);
    
    // Session expires after 8 hours
    if (hoursElapsed > 8) {
      logout();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

// Alias for backward compatibility
export const getAdminSession = getSession;

/**
 * Check if current session has admin role (from DB)
 * @returns {boolean}
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && (session.role === 'admin' || session.role === 'owner');
}

// Alias for backward compatibility
export const isAdminAuthenticated = isAdmin;
