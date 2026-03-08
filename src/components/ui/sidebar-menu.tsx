"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Crown,
  History,
  Clock,
  LayoutTemplate,
  LogOut,
  Sparkles,
  Wand2,
  Bookmark,
  Shield,
  UserCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Zap,
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
  section?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
  { id: 'generate', label: 'Prompt Generate', icon: Wand2, section: 'main' },
  { id: 'generative-ai', label: 'Generative AI', icon: Sparkles, section: 'main' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, section: 'main' },
  { id: 'history', label: 'History', icon: History, section: 'library' },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, section: 'library' },
  { id: 'notifications', label: 'Notifications', icon: Bell, section: 'library' },
  { id: 'upgrade', label: 'Upgrade Pro', icon: Crown, section: 'account' },
  { id: 'analytics', label: 'My Analytics', icon: Clock, section: 'account' },
  { id: 'profile', label: 'My Profile', icon: UserCircle, section: 'account' },
  { id: 'admin', label: 'Admin Panel', icon: Shield, adminOnly: true, section: 'account' },
];

const sections = [
  { key: 'main', label: 'WORKSPACE' },
  { key: 'library', label: 'LIBRARY' },
  { key: 'account', label: 'ACCOUNT' },
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
  const location = useLocation();

  // Sync active item with route
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (path) {
      const match = navItems.find(item => item.id === path);
      if (match) setActiveItem(match.id);
    }
  }, [location.pathname]);

  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }
    }
    checkAdmin();
  }, [user]);

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

  const sidebarWidth = isCollapsed ? 'w-[68px]' : 'w-[240px]';

  return (
    <aside
      className={`${sidebarWidth} h-screen flex flex-col transition-all duration-300 ease-out fixed left-0 top-0 z-40
        bg-sidebar border-r border-sidebar-border`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center h-16 border-b border-sidebar-border/50 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className={`font-display text-base font-bold text-sidebar-foreground transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
          AskJai
        </span>
      </div>

      {/* User Profile */}
      <div className={`border-b border-sidebar-border/50 transition-all duration-300 ${isCollapsed ? 'py-3 px-2 flex justify-center' : 'p-4'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? '' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-accent/60 text-primary-foreground font-semibold text-xs">
            {userInitials}
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <p className="font-medium text-sidebar-foreground truncate text-sm leading-tight">{userName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {sections.map((section) => {
          const sectionItems = filteredNavItems.filter(item => item.section === section.key);
          if (sectionItems.length === 0) return null;
          
          return (
            <div key={section.key} className="mb-2">
              {/* Section label */}
              <div className={`transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'px-3 pb-1.5 pt-3'}`}>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {section.label}
                </span>
              </div>
              {isCollapsed && section.key !== 'main' && (
                <div className="mx-3 my-2 border-t border-sidebar-border/30" />
              )}

              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative mb-0.5
                      ${isActive 
                        ? 'bg-primary/15 text-primary shadow-sm' 
                        : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                    
                    <span
                      className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active dot */}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full transition-all duration-300
                          ${isActive ? 'bg-primary/20 text-primary' : 'bg-destructive/15 text-destructive'}
                          ${isCollapsed ? 'absolute -top-0.5 -right-0.5 scale-75' : 'ml-auto'}
                        `}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-destructive/15 text-destructive rounded-full text-[10px]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Credit Badge */}
      <div className={`px-3 py-2 border-t border-sidebar-border/30 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <CreditBadge 
          showLabel={!isCollapsed} 
          size={isCollapsed ? 'sm' : 'md'}
          className={isCollapsed ? '' : 'w-full justify-center'}
        />
      </div>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-sidebar-border/50">
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative
            text-muted-foreground hover:text-destructive hover:bg-destructive/10
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span
            className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            }`}
          >
            Logout
          </span>

          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
