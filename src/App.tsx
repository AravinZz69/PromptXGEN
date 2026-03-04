import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CustomCursor from "@/components/ui/CustomCursor";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PromptGenerator from "./pages/PromptGenerator";
import Templates from "./pages/Templates";
import TemplateGenerator from "./pages/TemplateGenerator";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import GenerativeAI from "./pages/GenerativeAI";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";

// Admin Portal imports
import AdminApp from "./admin/AdminApp";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminDashboard from "./admin/pages/AdminDashboard";
import Analytics from "./admin/pages/Analytics";
import UserManagement from "./admin/pages/UserManagement";
import PromptManagement from "./admin/pages/PromptManagement";
import RevenueManagement from "./admin/pages/RevenueManagement";
import AIModelConfig from "./admin/pages/AIModelConfig";
import SupportTickets from "./admin/pages/SupportTickets";
import Notifications from "./admin/pages/Notifications";
import FeatureFlags from "./admin/pages/FeatureFlags";
import AuditLogs from "./admin/pages/AuditLogs";
import AdminSettings from "./admin/pages/AdminSettings";

const queryClient = new QueryClient();

// Component to handle animated routes
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <PromptGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generative-ai"
          element={
            <ProtectedRoute>
              <GenerativeAI />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/template/:templateId"
          element={
            <ProtectedRoute>
              <TemplateGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Portal Routes */}
        {/* Redirect /admin to /admin/dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        {/* Redirect old /admin/login to unified /auth */}
        <Route path="/admin/login" element={<Navigate to="/auth" replace />} />
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminApp />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="prompts" element={<PromptManagement />} />
          <Route path="revenue" element={<RevenueManagement />} />
          <Route path="ai-models" element={<AIModelConfig />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="feature-flags" element={<FeatureFlags />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog" element={<Blogs />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

// Enable custom cursor on mount
function CursorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only enable custom cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      document.documentElement.classList.add('custom-cursor');
    }
    return () => {
      document.documentElement.classList.remove('custom-cursor');
    };
  }, []);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <CursorProvider>
          <CustomCursor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </CursorProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
