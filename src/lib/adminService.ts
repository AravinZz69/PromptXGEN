import { supabase } from './supabase';

export type UserRole = 'user' | 'admin' | 'owner';

export interface AdminUser {
  id: string;
  user_id: string;
  role: UserRole;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_admins: number;
  total_owners: number;
  total_prompts: number;
  total_credits_used: number;
  new_users_today: number;
  new_users_week: number;
}

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile?: UserProfile;
  admin?: AdminUser;
  credits?: number;
}

// Check if current user is admin
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return false;
  return data.role === 'admin' || data.role === 'owner';
}

// Check if current user is owner
export async function checkIsOwner(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return false;
  return data.role === 'owner';
}

// Get current user's role
export async function getUserRole(): Promise<UserRole> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'user';

  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return 'user';
  return data.role;
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats | null> {
  const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
  
  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
  
  return data;
}

// Get all users with profiles
export async function getAllUsers(): Promise<UserWithProfile[]> {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      admin_users (
        id,
        role,
        created_at
      ),
      user_credits (
        credits_balance
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return profiles.map((p: any) => ({
    id: p.user_id,
    email: p.email || '',
    created_at: p.created_at,
    last_sign_in_at: p.last_login,
    profile: p,
    admin: p.admin_users?.[0],
    credits: p.user_credits?.[0]?.credits_balance || 0,
  }));
}

// Get all admin users
export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select(`
      *,
      user_profiles (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }

  return data.map((admin: any) => ({
    ...admin,
    email: admin.user_profiles?.email,
    full_name: admin.user_profiles?.full_name,
  }));
}

// Add new admin
export async function addAdmin(userId: string, role: UserRole = 'admin'): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('admin_users')
    .insert({
      user_id: userId,
      role: role,
      created_by: user.id,
    });

  if (error) {
    console.error('Error adding admin:', error);
    return { success: false, error: error.message };
  }

  // Grant unlimited credits to new admin
  await supabase
    .from('user_credits')
    .update({ total_credits: -1, plan_type: 'enterprise' })
    .eq('user_id', userId);

  return { success: true };
}

// Update admin role
export async function updateAdminRole(adminId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('admin_users')
    .update({ role: newRole })
    .eq('id', adminId);

  if (error) {
    console.error('Error updating admin role:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Remove admin
export async function removeAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', adminId);

  if (error) {
    console.error('Error removing admin:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Toggle user active status
export async function toggleUserActive(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { is_active: isActive });
}

// Update user credits (admin only) - sets total credits
export async function updateUserCredits(userId: string, credits: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_credits')
    .update({ total_credits: credits })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user credits:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Add credits to user (admin only) - adds to existing credits
export async function addCreditsToUser(userId: string, creditsToAdd: number): Promise<{ success: boolean; error?: string }> {
  // First get current credits
  const { data: currentData, error: fetchError } = await supabase
    .from('user_credits')
    .select('total_credits, used_credits')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching current credits:', fetchError);
    return { success: false, error: fetchError.message };
  }

  // Calculate new total (if unlimited, keep unlimited)
  const currentTotal = currentData.total_credits;
  if (currentTotal === -1) {
    return { success: true }; // Already unlimited
  }

  const newTotal = currentTotal + creditsToAdd;

  // Update credits
  const { error: updateError } = await supabase
    .from('user_credits')
    .update({ total_credits: newTotal })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error adding credits:', updateError);
    return { success: false, error: updateError.message };
  }

  // Log the transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: creditsToAdd,
    type: 'topup',
    description: 'Admin credit top-up',
  });

  return { success: true };
}

// Set user to unlimited credits (admin only)
export async function setUnlimitedCredits(userId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_credits')
    .update({ total_credits: -1, plan_type: 'enterprise' })
    .eq('user_id', userId);

  if (error) {
    console.error('Error setting unlimited credits:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Reset user credits to plan default (admin only)
export async function resetUserCredits(userId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_credits')
    .update({ used_credits: 0 })
    .eq('user_id', userId);

  if (error) {
    console.error('Error resetting credits:', error);
    return { success: false, error: error.message };
  }

  // Log the transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: 0,
    type: 'reset',
    description: 'Admin credit reset',
  });

  return { success: true };
}

// Grant admin unlimited credits when they become admin
export async function grantAdminUnlimitedCredits(userId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_credits')
    .update({ 
      total_credits: -1, 
      plan_type: 'enterprise' 
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error granting admin unlimited credits:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Get analytics data
export async function getAnalyticsData(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }

  return data;
}

// Get user activity by date
export async function getUserActivityByDate(days: number = 30) {
  const { data, error } = await supabase
    .from('prompt_history')
    .select('created_at, user_id')
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }

  // Group by date
  const activityByDate: Record<string, number> = {};
  data.forEach((item: any) => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    activityByDate[date] = (activityByDate[date] || 0) + 1;
  });

  return Object.entries(activityByDate).map(([date, count]) => ({
    date,
    count,
  }));
}

// Search users
export async function searchUsers(query: string): Promise<UserWithProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      admin_users (
        id,
        role,
        created_at
      ),
      user_credits (
        credits_balance
      )
    `)
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data.map((p: any) => ({
    id: p.user_id,
    email: p.email || '',
    created_at: p.created_at,
    last_sign_in_at: p.last_login,
    profile: p,
    admin: p.admin_users?.[0],
    credits: p.user_credits?.[0]?.credits_balance || 0,
  }));
}
