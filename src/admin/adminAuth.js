// Admin Authentication Helpers
// Unified auth system - single login for both users and admins
// Role is determined by credentials, stored in unified session

// ADMIN CREDENTIALS (replace with API call in production)
export const ADMIN_CREDENTIALS = {
  email: "admin@promptforge.com",
  password: "Admin@Secure2024!",
  role: "admin",
  name: "Super Admin"
};

// Unified session storage key
const SESSION_KEY = "appSession";

// Legacy key - will be migrated/cleared
const LEGACY_ADMIN_KEY = "adminSession";

/**
 * Check if credentials match admin account
 * @param {string} email 
 * @param {string} password 
 * @returns {boolean}
 */
export function isAdminCredentials(email, password) {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
}

/**
 * Login as admin (called when admin credentials are detected)
 * @param {string} email 
 * @param {string} password 
 * @returns {{ success: boolean, role: string, error?: string }}
 */
export function adminLogin(email, password) {
  if (isAdminCredentials(email, password)) {
    const session = {
      token: "admin-jwt-" + Date.now(),
      role: "admin",
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      loginTime: new Date().toISOString(),
      isAdmin: true
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Clear any legacy admin session
    localStorage.removeItem(LEGACY_ADMIN_KEY);
    return { success: true, role: "admin" };
  }
  return { success: false, error: "Invalid admin credentials" };
}

/**
 * Clear all sessions and logout
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_ADMIN_KEY);
}

// Alias for backward compatibility
export const adminLogout = logout;

/**
 * Get current unified session (admin or user)
 * @returns {Object|null} Session object or null if invalid/expired
 */
export function getSession() {
  try {
    // Check for legacy admin session and migrate
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
 * Check if current session has admin role
 * @returns {boolean}
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && session.role === "admin";
}

// Alias for backward compatibility
export const isAdminAuthenticated = isAdmin;
