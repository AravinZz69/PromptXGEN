import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserRole,
  DashboardStats,
  AdminUser,
  UserWithProfile,
  checkIsAdmin,
  checkIsOwner,
  getUserRole,
  getDashboardStats,
  getAllUsers,
  getAdminUsers,
  addAdmin,
  updateAdminRole,
  removeAdmin,
  updateUserProfile,
  toggleUserActive,
  updateUserCredits,
  addCreditsToUser,
  setUnlimitedCredits,
  resetUserCredits,
  searchUsers,
  getUserActivityByDate,
} from '@/lib/adminService';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<{ date: string; count: number }[]>([]);

  // Check admin status on mount
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setIsOwner(false);
        setUserRole('user');
        setLoading(false);
        return;
      }

      try {
        const [adminStatus, ownerStatus, role] = await Promise.all([
          checkIsAdmin(),
          checkIsOwner(),
          getUserRole(),
        ]);

        setIsAdmin(adminStatus);
        setIsOwner(ownerStatus);
        setUserRole(role);
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const [statsData, usersData, adminsData, activityData] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getAdminUsers(),
        getUserActivityByDate(30),
      ]);

      if (statsData) setStats(statsData);
      setUsers(usersData);
      setAdmins(adminsData);
      setActivity(activityData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [isAdmin]);

  // Refresh stats only
  const refreshStats = useCallback(async () => {
    const statsData = await getDashboardStats();
    if (statsData) setStats(statsData);
  }, []);

  // Refresh users only
  const refreshUsers = useCallback(async () => {
    const usersData = await getAllUsers();
    setUsers(usersData);
  }, []);

  // Refresh admins only
  const refreshAdmins = useCallback(async () => {
    const adminsData = await getAdminUsers();
    setAdmins(adminsData);
  }, []);

  // Add admin handler
  const handleAddAdmin = useCallback(async (userId: string, role: UserRole = 'admin') => {
    const result = await addAdmin(userId, role);
    if (result.success) {
      await refreshAdmins();
      await refreshUsers();
    }
    return result;
  }, [refreshAdmins, refreshUsers]);

  // Update admin role handler
  const handleUpdateAdminRole = useCallback(async (adminId: string, newRole: UserRole) => {
    const result = await updateAdminRole(adminId, newRole);
    if (result.success) {
      await refreshAdmins();
    }
    return result;
  }, [refreshAdmins]);

  // Remove admin handler
  const handleRemoveAdmin = useCallback(async (adminId: string) => {
    const result = await removeAdmin(adminId);
    if (result.success) {
      await refreshAdmins();
      await refreshUsers();
    }
    return result;
  }, [refreshAdmins, refreshUsers]);

  // Update user profile handler
  const handleUpdateProfile = useCallback(async (userId: string, updates: any) => {
    const result = await updateUserProfile(userId, updates);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  // Toggle user active handler
  const handleToggleUserActive = useCallback(async (userId: string, isActive: boolean) => {
    const result = await toggleUserActive(userId, isActive);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  // Update credits handler
  const handleUpdateCredits = useCallback(async (userId: string, credits: number) => {
    const result = await updateUserCredits(userId, credits);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  // Add credits handler
  const handleAddCredits = useCallback(async (userId: string, creditsToAdd: number) => {
    const result = await addCreditsToUser(userId, creditsToAdd);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  // Set unlimited credits handler
  const handleSetUnlimitedCredits = useCallback(async (userId: string) => {
    const result = await setUnlimitedCredits(userId);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  // Reset credits handler
  const handleResetCredits = useCallback(async (userId: string) => {
    const result = await resetUserCredits(userId);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  // Search users handler
  const handleSearchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      await refreshUsers();
      return;
    }
    const results = await searchUsers(query);
    setUsers(results);
  }, [refreshUsers]);

  return {
    // Status
    isAdmin,
    isOwner,
    userRole,
    loading,
    
    // Data
    stats,
    users,
    admins,
    activity,
    
    // Actions
    loadDashboardData,
    refreshStats,
    refreshUsers,
    refreshAdmins,
    
    // Admin management
    addAdmin: handleAddAdmin,
    updateAdminRole: handleUpdateAdminRole,
    removeAdmin: handleRemoveAdmin,
    
    // User management
    updateProfile: handleUpdateProfile,
    toggleUserActive: handleToggleUserActive,
    updateCredits: handleUpdateCredits,
    addCredits: handleAddCredits,
    setUnlimitedCredits: handleSetUnlimitedCredits,
    resetCredits: handleResetCredits,
    searchUsers: handleSearchUsers,
  };
}

export default useAdmin;
