"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Crown,
  History,
  Clock,
  LayoutTemplate,
  BookOpen,
  LogOut,
  Sparkles,
  Wand2,
  Bookmark,
  Shield,
  UserCircle,
} from 'lucide-react';
import { CreditBadge } from '@/components/credits/CreditBadge';
import { checkIsAdmin } from '@/lib/adminService';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'generate', label: 'Prompt Generate', icon: Wand2 },
  { id: 'generative-ai', label: 'Generative AI', icon: Sparkles },
  { id: 'upgrade', label: 'Upgrade Pro', icon: Crown },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'history', label: 'Prompt/Chat History', icon: History },
  { id: 'analytics', label: 'My Analytics', icon: Clock },
  { id: 'profile', label: 'My Profile', icon: UserCircle },
  { id: 'admin', label: 'Admin Panel', icon: Shield, adminOnly: true },
];

interface SidebarProps {
  userName?: string;
  userRole?: string;
  userInitials?: string;
  onNavigate?: (itemId: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({
  userName = 'John Doe',
  userRole = 'Admin',
  userInitials = 'JD',
  onNavigate,
  onLogout,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }
    }
    checkAdmin();
  }, [user]);

  // Filter nav items based on admin status
  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleNavClick = (itemId: string) => {
    setActiveItem(itemId);
    onNavigate?.(itemId);
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const handleMouseEnter = () => setIsCollapsed(false);
  const handleMouseLeave = () => setIsCollapsed(true);

  const sidebarWidth = isCollapsed ? 'w-[70px]' : 'w-[240px]';
  const bgColor = 'bg-[#1a1a2e]';
  const textColor = 'text-muted-foreground';
  const textMutedColor = 'text-muted-foreground';
  const borderColor = 'border-gray-700/50';
  const hoverBg = 'hover:bg-muted/50';

  return (
    <aside
      className={`${sidebarWidth} ${bgColor} h-screen flex flex-col transition-all duration-300 ease-in-out fixed left-0 top-0 z-40`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* User Profile Section */}
      <div
        className={`p-4 border-b ${borderColor} transition-all duration-300 ${
          isCollapsed ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold text-sm">
            {userInitials}
          </div>
          {/* Name & Role */}
          <div className="overflow-hidden">
            <p className={`font-medium ${textColor} truncate text-sm`}>{userName}</p>
            <p className={`text-xs ${textMutedColor} truncate`}>{userRole}</p>
          </div>
        </div>
      </div>

      {/* Collapsed Avatar (shown only when collapsed) */}
      {isCollapsed && (
        <div className="flex justify-center py-4 border-b border-gray-700/50">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold text-sm cursor-pointer"
            title={`${userName} - ${userRole}`}
          >
            {userInitials}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${isActive ? 'bg-[#7C3AED] text-white' : `${textColor} ${hoverBg}`}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              
              {/* Label */}
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                }`}
              >
                {item.label}
              </span>

              {/* Badge */}
              {item.badge && (
                <span
                  className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full transition-all duration-300
                    ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}
                    ${isCollapsed ? 'absolute -top-1 -right-1 scale-75' : 'ml-auto'}
                  `}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 rounded-full text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className={`my-4 border-t ${borderColor}`} />

        {/* Credit Badge */}
        <div className={`px-3 py-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <CreditBadge 
            showLabel={!isCollapsed} 
            size={isCollapsed ? 'sm' : 'md'}
            className={isCollapsed ? '' : 'w-full justify-center'}
          />
        </div>

        {/* Divider */}
        <div className={`my-2 border-t ${borderColor}`} />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
            text-red-400 hover:bg-red-500/10 hover:text-red-300
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            }`}
          >
            Logout
          </span>

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
              Logout
            </div>
          )}
        </button>
      </nav>
    </aside>
  );
}
