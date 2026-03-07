import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, ChevronDown, User, Key, LogOut } from 'lucide-react';
import { getAdminSession, adminLogout } from '../adminAuth';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/analytics': 'Analytics',
  '/admin/users': 'User Management',
  '/admin/revenue': 'Revenue Management',
  '/admin/prompts': 'Prompts Management',
  '/admin/ai-models': 'AI Model Configuration',
  '/admin/feature-flags': 'Feature Flags',
  '/admin/notifications': 'Notifications',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/settings': 'Settings',
};

export default function AdminTopbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const session = getAdminSession();

  const pageTitle = pageTitles[location.pathname] || 'Admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-10 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Page title */}
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-20 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent">
          <Bell className="w-5 h-5" />
          {/* MOCK DATA - Notification badge */}
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Admin profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              SA
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {session?.name || 'Admin'}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-sidebar border border-sidebar-border rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-sidebar-border">
                <p className="text-sm font-medium text-foreground">{session?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.email}</p>
              </div>
              <div className="py-1">
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
                  <Key className="w-4 h-4" />
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
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
