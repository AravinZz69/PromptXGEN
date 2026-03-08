import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  User,
  Key,
  LogOut,
  Command,
  Settings,
  Moon,
  Sun,
  ExternalLink,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { getAdminSession, adminLogout } from '../adminAuth';
import { supabase } from '@/lib/supabase';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/analytics': 'Analytics',
  '/admin/users': 'User Management',
  '/admin/revenue': 'Revenue Management',
  '/admin/payment-gateway': 'Payment Gateway',
  '/admin/prompts': 'Prompts Management',
  '/admin/ai-models': 'AI Model Configuration',
  '/admin/feature-flags': 'Feature Flags',
  '/admin/notifications': 'Notifications',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/settings': 'Settings',
  '/admin/theme': 'Theme Manager',
  '/admin/hero': 'Hero Editor',
  '/admin/features-editor': 'Features Editor',
  '/admin/pricing-editor': 'Pricing Editor',
  '/admin/blog': 'Blog Manager',
  '/admin/faq': 'FAQ Editor',
  '/admin/team': 'Team Editor',
  '/admin/media': 'Media Manager',
  '/admin/site-config': 'Site Config',
  '/admin/templates': 'Templates',
  '/admin/history': 'History Viewer',
  '/admin/auth-config': 'Auth Config',
  '/admin/auth-pages': 'Auth Pages',
  '/admin/support-tickets': 'Support Tickets',
};

const pageIcons = {
  '/admin/dashboard': LayoutDashboard,
  '/admin/settings': Settings,
};

const quickLinks = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Templates', path: '/admin/templates' },
  { label: 'Theme', path: '/admin/theme' },
  { label: 'Settings', path: '/admin/settings' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Hero Editor', path: '/admin/hero' },
  { label: 'Notifications', path: '/admin/notifications' },
  { label: 'Revenue', path: '/admin/revenue' },
  { label: 'AI Models', path: '/admin/ai-models' },
];

export default function AdminTopbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const session = getAdminSession();

  const pageTitle = pageTitles[location.pathname] || 'Admin';

  // Build breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
    isLast: i === pathSegments.length - 1,
  }));

  // Filter search results
  const searchResults = searchQuery.length > 0
    ? quickLinks.filter(link =>
        link.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { count } = await supabase
          .from('admin_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        setUnreadCount(count || 0);
      } catch (err) {
        // Fallback: try notifications table
        try {
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);
          setUnreadCount(count || 0);
        } catch {
          setUnreadCount(0);
        }
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut CMD+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/auth');
  };

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="sticky top-0 z-10 h-14 bg-card/70 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-3 lg:px-5 gap-3">
      {/* Left section */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.path}>
              {i > 0 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
              )}
              {crumb.isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[180px]">
                  {pageTitle}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-muted-foreground/70 hover:text-foreground transition-colors truncate text-xs uppercase tracking-wide font-medium"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
        <h1 className="sm:hidden text-base font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Center - Command Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length > 0);
            }}
            placeholder="Search pages..."
            onFocus={() => {
              setSearchFocused(true);
              if (searchQuery.length > 0) setShowSearchResults(true);
            }}
            onBlur={() => setSearchFocused(false)}
            className={`w-full pl-9 pr-16 py-1.5 rounded-lg text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-200
              ${searchFocused
                ? 'bg-background border-primary/40 ring-1 ring-primary/15 border shadow-sm shadow-primary/5'
                : 'bg-muted/40 border border-border/40 hover:border-border/70'
              }
              focus:outline-none`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[9px] text-muted-foreground/40 bg-background/60 px-1.5 py-0.5 rounded border border-border/30">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/60 rounded-xl shadow-2xl shadow-black/20 overflow-hidden z-50">
              <div className="py-1.5 max-h-64 overflow-y-auto">
                {searchResults.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleSearchSelect(link.path)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                      location.pathname === link.path
                        ? 'text-primary bg-primary/5'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span>{link.label}</span>
                    {location.pathname === link.path && (
                      <span className="ml-auto text-[10px] text-primary/60 font-medium">Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* View Site Link */}
        <Link
          to="/"
          target="_blank"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Site
        </Link>

        {/* Notifications */}
        <Link
          to="/admin/notifications"
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center ring-2 ring-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Separator */}
        <div className="w-px h-6 bg-border/40 mx-0.5 hidden sm:block" />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 p-1 rounded-lg transition-all duration-150 ${
              showDropdown ? 'bg-muted/70' : 'hover:bg-muted/50'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
              {(session?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-medium text-foreground max-w-[90px] truncate leading-tight">
                {session?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-muted-foreground/60 leading-tight">
                Admin
              </span>
            </div>
            <ChevronDown
              className={`w-3 h-3 text-muted-foreground/50 transition-transform duration-200 hidden sm:block ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 bg-card border border-border/60 rounded-xl shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.name || 'Admin'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {session?.email || 'admin@askjai.com'}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1 px-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  System Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-border/40 py-1 px-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
