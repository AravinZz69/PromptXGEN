// Admin Authentication Helpers
// TODO: Replace hardcoded credentials with API call in production

// MOCK DATA - Admin credentials (replace with API in production)
export const ADMIN_CREDENTIALS = {
  email: "admin@promptforge.com",
  password: "Admin@Secure2024!",
  role: "admin",
  name: "Super Admin"
};

/**
 * Attempt admin login with provided credentials
 * @param {string} email 
 * @param {string} password 
 * @returns {{ success: boolean, error?: string }}
 */
export function adminLogin(email, password) {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const session = {
      token: "admin-jwt-placeholder-" + Date.now(),
      role: "admin",
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("adminSession", JSON.stringify(session));
    return { success: true };
  }
  return { success: false, error: "Invalid admin credentials" };
}

/**
 * Clear admin session and logout
 */
export function adminLogout() {
  localStorage.removeItem("adminSession");
}

/**
 * Get current admin session if valid
 * @returns {Object|null} Session object or null if invalid/expired
 */
export function getAdminSession() {
  try {
    const raw = localStorage.getItem("adminSession");
    if (!raw) return null;
    
    const session = JSON.parse(raw);
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursElapsed = (now - loginTime) / (1000 * 60 * 60);
    
    // Session expires after 8 hours
    if (hoursElapsed > 8) {
      localStorage.removeItem("adminSession");
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Check if current session is valid admin session
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  const session = getAdminSession();
  return session !== null && session.role === "admin";
}
