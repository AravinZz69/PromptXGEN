import { Navigate, useLocation } from 'react-router-dom';
import { getAdminSession } from './adminAuth';

/**
 * Protected route wrapper for admin pages
 * Redirects to /admin/login if not authenticated or session expired
 */
export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const session = getAdminSession();
  
  // Check if session exists and has admin role
  if (!session || session.role !== "admin") {
    // Redirect to admin login, preserving the attempted URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Check if session is expired (8 hours)
  const loginTime = new Date(session.loginTime);
  const now = new Date();
  const hoursElapsed = (now - loginTime) / (1000 * 60 * 60);
  
  if (hoursElapsed > 8) {
    localStorage.removeItem("adminSession");
    return <Navigate to="/admin/login" state={{ from: location, expired: true }} replace />;
  }
  
  return children;
}
