import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { adminLogin, getAdminSession } from '../adminAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const session = getAdminSession();
    if (session && session.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  // Check for session expiry message
  useEffect(() => {
    if (location.state?.expired) {
      setError('Your session has expired. Please log in again.');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay (800ms as specified)
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = await adminLogin(email, password);
    
    if (result.success) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } else {
      setError('Invalid admin credentials. Access denied.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated dot-grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Login Card */}
      <div 
        className={`relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 transition-transform ${
          shake ? 'animate-shake' : ''
        }`}
        style={{
          animation: shake ? 'shake 0.5s ease-in-out' : 'none',
        }}
      >
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/10">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Portal</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          AskJai Internal — Authorized Access Only
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@askjai.com"
                required
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className="w-full pl-11 pr-12 py-3 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Device */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-primary focus:ring-offset-0"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
              Remember this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary disabled:bg-primary/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In to Admin'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need access? Contact your system administrator.
        </p>
      </div>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
