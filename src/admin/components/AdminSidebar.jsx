import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  DollarSign,
  History,
  Cpu,
  ToggleLeft,
  Bell,
  ScrollText,
  Settings,
  LogOut,
  Sparkles,
  Palette,
  LayoutTemplate,
  Zap,
  CreditCard,
  FileText,
  HelpCircle,
  Users as UsersIcon,
  Image,
  Settings2,
  BookTemplate,
  Clock,
  Wallet,
  Shield,
  KeyRound,
} from 'lucide-react';
import { adminLogout } from '../adminAuth';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'USER CONTROL',
    items: [
      { to: '/admin/users', icon: Users, label: 'Users' },
    ],
  },
  {
    label: 'MONETIZATION',
    items: [
      { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
      { to: '/admin/payment-gateway', icon: Wallet, label: 'Payment Gateway' },
    ],
  },
  {
    label: 'PRODUCT',
    items: [
      { to: '/admin/templates', icon: BookTemplate, label: 'Templates' },
      { to: '/admin/prompts', icon: History, label: 'Prompts Management' },
      { to: '/admin/history', icon: Clock, label: 'History Viewer' },
      { to: '/admin/ai-models', icon: Cpu, label: 'AI Models' },
      { to: '/admin/feature-flags', icon: ToggleLeft, label: 'Feature Flags' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { to: '/admin/theme', icon: Palette, label: 'Theme Manager' },
      { to: '/admin/hero', icon: LayoutTemplate, label: 'Hero Editor' },
      { to: '/admin/features-editor', icon: Zap, label: 'Features Editor' },
      { to: '/admin/pricing-editor', icon: CreditCard, label: 'Pricing Editor' },
      { to: '/admin/blog', icon: FileText, label: 'Blog Manager' },
      { to: '/admin/faq', icon: HelpCircle, label: 'FAQ Editor' },
      { to: '/admin/team', icon: UsersIcon, label: 'Team Editor' },
      { to: '/admin/media', icon: Image, label: 'Media Manager' },
      { to: '/admin/site-config', icon: Settings2, label: 'Site Config' },
      { to: '/admin/auth-pages', icon: KeyRound, label: 'Auth Pages' },
    ],
  },
  {
    label: 'COMMUNICATIONS',
    items: [
      { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/admin/auth-config', icon: Shield, label: 'Auth Config' },
      { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/auth');
  };

  // Only close sidebar on mobile (< 1024px)
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - always visible on lg screens, toggle on mobile */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-200 
          lg:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">AskJai</span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto py-4" style={{ height: 'calc(100vh - 4rem - 4.5rem)' }}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent border-l-2 border-transparent'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
