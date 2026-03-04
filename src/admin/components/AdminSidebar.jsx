import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  HeadphonesIcon,
  DollarSign,
  MessageSquare,
  Cpu,
  ToggleLeft,
  Bell,
  ScrollText,
  Settings,
  LogOut,
  Sparkles,
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
      { to: '/admin/support', icon: HeadphonesIcon, label: 'Support Tickets' },
    ],
  },
  {
    label: 'MONETIZATION',
    items: [
      { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
    ],
  },
  {
    label: 'PRODUCT',
    items: [
      { to: '/admin/prompts', icon: MessageSquare, label: 'Prompts' },
      { to: '/admin/ai-models', icon: Cpu, label: 'AI Models' },
      { to: '/admin/feature-flags', icon: ToggleLeft, label: 'Feature Flags' },
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
        className={`fixed left-0 top-0 h-full w-64 bg-[#111827] border-r border-gray-800 z-50 transition-transform duration-200 
          lg:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">PromptForge</span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto py-4" style={{ height: 'calc(100vh - 4rem - 4.5rem)' }}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-l-2 border-transparent'
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-[#111827]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
