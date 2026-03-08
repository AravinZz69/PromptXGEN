import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Users, DollarSign, History, Cpu, ToggleLeft,
  Bell, ScrollText, Settings, LogOut, Sparkles, Palette, LayoutTemplate, Zap,
  CreditCard, FileText, HelpCircle, Users as UsersIcon, Image, Settings2,
  BookTemplate, Clock, Wallet, Shield, KeyRound, ChevronDown, ChevronRight,
  Activity, Crown, ArrowDownToLine, Headphones,
} from 'lucide-react';
import { useUpdateChecker } from '../hooks/useUpdateChecker';
import { adminLogout } from '../adminAuth';
import { getMyPermissions, ROUTE_PERMISSION_MAP } from '@/lib/permissionsService';

const navGroups = [
  {
    label: 'OVERVIEW',
    icon: Activity,
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'USER CONTROL',
    icon: Users,
    items: [
      { to: '/admin/users', icon: Users, label: 'Users' },
    ],
  },
  {
    label: 'MONETIZATION',
    icon: DollarSign,
    items: [
      { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
      { to: '/admin/payment-gateway', icon: Wallet, label: 'Payment Gateway' },
    ],
  },
  {
    label: 'PRODUCT',
    icon: Cpu,
    items: [
      { to: '/admin/templates', icon: BookTemplate, label: 'Templates' },
      { to: '/admin/prompts', icon: History, label: 'Prompts' },
      { to: '/admin/history', icon: Clock, label: 'History Viewer' },
      { to: '/admin/ai-models', icon: Cpu, label: 'AI Models' },
      { to: '/admin/feature-flags', icon: ToggleLeft, label: 'Feature Flags' },
    ],
  },
  {
    label: 'CONTENT',
    icon: FileText,
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
    icon: Bell,
    items: [
      { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
      { to: '/admin/support-tickets', icon: Headphones, label: 'Support Tickets' },
    ],
  },
  {
    label: 'SYSTEM',
    icon: Shield,
    items: [
      { to: '/admin/auth-config', icon: Shield, label: 'Auth Config' },
      { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
      { to: '/admin/roles', icon: Crown, label: 'Role Management' },
      { to: '/admin/updates', icon: ArrowDownToLine, label: 'Updates', hasUpdateBadge: true },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function SidebarGroup({ group, onNavClick, allowedPermissions, isSuperAdmin, updateBadge }) {
  const location = useLocation();
  
  // Filter items based on permissions
  const visibleItems = group.items.filter(item => {
    if (isSuperAdmin) return true;
    const permKey = ROUTE_PERMISSION_MAP[item.to];
    if (!permKey) return true;
    return allowedPermissions.includes(permKey);
  });

  // Hide entire group if no items are visible
  if (visibleItems.length === 0) return null;

  const isActiveGroup = visibleItems.some(item => location.pathname === item.to);
  const [isOpen, setIsOpen] = useState(isActiveGroup);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150
          ${isActiveGroup 
            ? 'text-primary' 
            : 'text-muted-foreground hover:text-sidebar-foreground'
          }`}
      >
        <group.icon className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 ml-3 mr-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-primary/15 text-primary shadow-sm shadow-primary/5'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
            <span className="truncate">{item.label}</span>
            {item.hasUpdateBadge && updateBadge.count > 0 && (
              <span className={`ml-auto w-5 h-5 flex items-center justify-center rounded-full text-xs text-white font-bold ${updateBadge.critical ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'}`}>
                {updateBadge.count}
              </span>
            )}
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0' : 'hidden'
              }
            >
              {() => null}
            </NavLink>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [allowedPermissions, setAllowedPermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const [adminRole, setAdminRole] = useState('admin');
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const { unreadCount, isCritical } = useUpdateChecker();

  useEffect(() => {
    getMyPermissions().then(({ permissions, role, isSuperAdmin: isSA }) => {
      // If permissions came back empty but user passed AdminProtectedRoute, grant all access
      const hasPermissions = permissions && permissions.length > 0;
      setAllowedPermissions(hasPermissions ? permissions : Object.keys(ADMIN_PERMISSIONS));
      setIsSuperAdmin(isSA || !hasPermissions); // Treat as super admin if permissions query failed
      setAdminRole(role);
      setPermissionsLoaded(true);
    }).catch(() => {
      // On error, show all items since AdminProtectedRoute already verified access
      setAllowedPermissions(Object.keys(ADMIN_PERMISSIONS));
      setIsSuperAdmin(true);
      setPermissionsLoaded(true);
    });
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/auth');
  };

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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300 ease-out
          lg:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95
          border-r border-sidebar-border/50
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-sidebar-foreground leading-tight">AskJai</span>
            <span className="text-[10px] font-medium text-primary/80 uppercase tracking-widest">
              {isSuperAdmin ? 'Super Admin' : 'Admin Panel'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav 
          className="overflow-y-auto py-3 scrollbar-thin"
          style={{ height: 'calc(100vh - 4rem - 5rem)' }}
        >
          {navGroups.map((group) => (
            <SidebarGroup 
              key={group.label} 
              group={group} 
              onNavClick={handleNavClick}
              allowedPermissions={allowedPermissions}
              isSuperAdmin={isSuperAdmin}
              updateBadge={{ count: unreadCount, critical: isCritical }}
            />
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border/50 bg-sidebar/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
