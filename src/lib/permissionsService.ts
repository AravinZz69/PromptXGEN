/**
 * Admin Permissions Service
 * Manages role-based access control for the admin panel.
 * 
 * Roles:
 *   - super_admin (owner): Full access to everything, can manage other admins' permissions
 *   - admin: Configurable permissions per section
 * 
 * Permissions are stored as a JSON array in admin_users.permissions column.
 * Super admins always bypass permission checks.
 */

import { supabase } from './supabase';

// All available admin permission keys mapped to sidebar sections
export const ADMIN_PERMISSIONS = {
  dashboard: { label: 'Dashboard', group: 'OVERVIEW', description: 'View admin dashboard & stats' },
  analytics: { label: 'Analytics', group: 'OVERVIEW', description: 'View analytics data' },
  users: { label: 'User Management', group: 'USER CONTROL', description: 'Manage users, activate/deactivate' },
  revenue: { label: 'Revenue', group: 'MONETIZATION', description: 'View revenue data' },
  payment_gateway: { label: 'Payment Gateway', group: 'MONETIZATION', description: 'Configure payment providers' },
  templates: { label: 'Templates', group: 'PRODUCT', description: 'Manage prompt templates' },
  prompts: { label: 'Prompts', group: 'PRODUCT', description: 'Manage prompts' },
  history: { label: 'History Viewer', group: 'PRODUCT', description: 'View user history' },
  ai_models: { label: 'AI Models', group: 'PRODUCT', description: 'Configure AI model settings' },
  feature_flags: { label: 'Feature Flags', group: 'PRODUCT', description: 'Toggle feature flags' },
  theme: { label: 'Theme Manager', group: 'CONTENT', description: 'Manage themes & appearance' },
  hero: { label: 'Hero Editor', group: 'CONTENT', description: 'Edit hero section' },
  features_editor: { label: 'Features Editor', group: 'CONTENT', description: 'Edit features section' },
  pricing_editor: { label: 'Pricing Editor', group: 'CONTENT', description: 'Edit pricing section' },
  blog: { label: 'Blog Manager', group: 'CONTENT', description: 'Manage blog posts' },
  faq: { label: 'FAQ Editor', group: 'CONTENT', description: 'Edit FAQ section' },
  team: { label: 'Team Editor', group: 'CONTENT', description: 'Edit team section' },
  media: { label: 'Media Manager', group: 'CONTENT', description: 'Manage media files' },
  site_config: { label: 'Site Config', group: 'CONTENT', description: 'Configure site settings' },
  auth_pages: { label: 'Auth Pages', group: 'CONTENT', description: 'Edit auth page appearance' },
  notifications: { label: 'Notifications', group: 'COMMUNICATIONS', description: 'Send & manage notifications' },
  support_tickets: { label: 'Support Tickets', group: 'COMMUNICATIONS', description: 'View & manage support tickets from users' },
  auth_config: { label: 'Auth Config', group: 'SYSTEM', description: 'Configure authentication providers' },
  audit_logs: { label: 'Audit Logs', group: 'SYSTEM', description: 'View audit logs' },
  settings: { label: 'Settings', group: 'SYSTEM', description: 'Admin panel settings' },
  role_management: { label: 'Role Management', group: 'SYSTEM', description: 'Manage admin roles & permissions' },
  updates: { label: 'Updates', group: 'SYSTEM', description: 'View and manage application updates' },
} as const;

export type PermissionKey = keyof typeof ADMIN_PERMISSIONS;

// Map route paths to permission keys
export const ROUTE_PERMISSION_MAP: Record<string, PermissionKey> = {
  '/admin/dashboard': 'dashboard',
  '/admin/analytics': 'analytics',
  '/admin/users': 'users',
  '/admin/revenue': 'revenue',
  '/admin/payment-gateway': 'payment_gateway',
  '/admin/templates': 'templates',
  '/admin/prompts': 'prompts',
  '/admin/history': 'history',
  '/admin/ai-models': 'ai_models',
  '/admin/feature-flags': 'feature_flags',
  '/admin/theme': 'theme',
  '/admin/hero': 'hero',
  '/admin/features-editor': 'features_editor',
  '/admin/pricing-editor': 'pricing_editor',
  '/admin/blog': 'blog',
  '/admin/faq': 'faq',
  '/admin/team': 'team',
  '/admin/media': 'media',
  '/admin/site-config': 'site_config',
  '/admin/auth-pages': 'auth_pages',
  '/admin/notifications': 'notifications',
  '/admin/support-tickets': 'support_tickets',
  '/admin/auth-config': 'auth_config',
  '/admin/audit-logs': 'audit_logs',
  '/admin/settings': 'settings',
  '/admin/roles': 'role_management',
  '/admin/updates': 'updates',
};

// All permission keys as array
export const ALL_PERMISSION_KEYS: PermissionKey[] = Object.keys(ADMIN_PERMISSIONS) as PermissionKey[];

// Cache for current user's permissions
let permissionsCache: { permissions: PermissionKey[]; role: string; userId: string } | null = null;

/**
 * Get current admin user's permissions
 */
export async function getMyPermissions(): Promise<{ permissions: PermissionKey[]; role: string; isSuperAdmin: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { permissions: [], role: 'user', isSuperAdmin: false };

  // Check cache
  if (permissionsCache && permissionsCache.userId === user.id) {
    const isSuperAdmin = permissionsCache.role === 'owner';
    return {
      permissions: isSuperAdmin ? ALL_PERMISSION_KEYS : permissionsCache.permissions,
      role: permissionsCache.role,
      isSuperAdmin,
    };
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return { permissions: [], role: 'user', isSuperAdmin: false };

  const role = data.role;
  const isSuperAdmin = role === 'owner';
  const permissions: PermissionKey[] = isSuperAdmin
    ? ALL_PERMISSION_KEYS
    : (data.permissions || ALL_PERMISSION_KEYS); // Default: all permissions for existing admins

  permissionsCache = { permissions, role, userId: user.id };

  return { permissions, role, isSuperAdmin };
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permission: PermissionKey): Promise<boolean> {
  const { permissions, isSuperAdmin } = await getMyPermissions();
  if (isSuperAdmin) return true;
  return permissions.includes(permission);
}

/**
 * Check if current user has permission for a route
 */
export async function hasRoutePermission(route: string): Promise<boolean> {
  const permissionKey = ROUTE_PERMISSION_MAP[route];
  if (!permissionKey) return true; // Unknown routes are allowed
  return hasPermission(permissionKey);
}

/**
 * Get permissions for a specific admin user (super admin only)
 */
export async function getAdminPermissions(adminUserId: string): Promise<PermissionKey[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('user_id', adminUserId)
    .single();

  if (error || !data) return [];
  if (data.role === 'owner') return ALL_PERMISSION_KEYS;
  return data.permissions || ALL_PERMISSION_KEYS;
}

/**
 * Update permissions for an admin user (super admin only)
 */
export async function updateAdminPermissions(
  adminUserId: string,
  permissions: PermissionKey[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ permissions, updated_at: new Date().toISOString() })
      .eq('user_id', adminUserId);

    if (error) throw error;

    // Clear cache if updating own permissions
    if (permissionsCache?.userId === adminUserId) {
      permissionsCache = null;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Clear permissions cache (call on logout or role change)
 */
export function clearPermissionsCache() {
  permissionsCache = null;
}
