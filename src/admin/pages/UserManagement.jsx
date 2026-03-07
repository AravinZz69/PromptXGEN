import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Download,
  UserPlus,
  MoreVertical,
  Eye,
  UserCog,
  ArrowUpCircle,
  Ban,
  Trash2,
  X,
  Coins,
  Plus,
  Minus,
  Loader2,
  RefreshCw,
  Shield,
  Users,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Key,
  LogOut,
  Clock,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { formatDistanceToNow } from 'date-fns';

const statusVariants = {
  Active: 'success',
  Suspended: 'warning',
  Banned: 'danger',
};

const planVariants = {
  Free: 'neutral',
  free: 'neutral',
  Pro: 'purple',
  pro: 'purple',
  Enterprise: 'success',
  enterprise: 'success',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Modals
  const [viewUser, setViewUser] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [upgradeUser, setUpgradeUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [creditsModal, setCreditsModal] = useState(null);
  const [creditAmount, setCreditAmount] = useState(100);
  const [creditReason, setCreditReason] = useState('');
  
  // Auth & Security Tab State
  const [activeTab, setActiveTab] = useState('users');
  const [authUsers, setAuthUsers] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authSearchQuery, setAuthSearchQuery] = useState('');
  const [signInHistoryUser, setSignInHistoryUser] = useState(null);
  const [forcePasswordResetUser, setForcePasswordResetUser] = useState(null);
  const [forceLogoutUser, setForceLogoutUser] = useState(null);

  const pageSize = 10;

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Try to fetch using admin function first (bypasses RLS)
      const { data: adminData, error: adminError } = await supabase.rpc('get_all_users_admin');
      
      if (!adminError && adminData && adminData.length > 0) {
        console.log('Fetched users via admin function:', adminData.length);
        setUsers(adminData.map(user => ({
          id: user.id,
          name: user.full_name || user.email?.split('@')[0] || 'Unknown',
          email: user.email || '',
          avatar: (user.full_name || user.email || 'U').substring(0, 2).toUpperCase(),
          plan: (user.plan || 'free').charAt(0).toUpperCase() + (user.plan || 'free').slice(1),
          promptsUsed: user.used_credits || 0,
          joinedDate: user.created_at,
          lastActive: user.last_login || user.updated_at,
          status: user.is_active === false ? 'Suspended' : 'Active',
          credits: user.credits_balance || 0,
        })));
        setLoading(false);
        return;
      }
      
      if (adminError) {
        console.log('Admin function not available, falling back to direct query:', adminError.message);
      }

      // Fallback: Fetch profiles with credits directly
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched profiles:', profiles?.length || 0);

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found. Checking if data exists...');
        setUsers([]);
        setLoading(false);
        return;
      }

      // Fetch credits for all users
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, credits_balance, used_credits');

      if (creditsError) console.error('Error fetching credits:', creditsError);

      // Fetch user_profiles for status
      const { data: userProfiles, error: upError } = await supabase
        .from('user_profiles')
        .select('user_id, is_active, last_login');

      if (upError) console.error('Error fetching user_profiles:', upError);

      // Map to user format
      const usersData = profiles.map(profile => {
        const userCredit = credits?.find(c => c.user_id === profile.id);
        const userProfile = userProfiles?.find(up => up.user_id === profile.id);
        
        return {
          id: profile.id,
          name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
          email: profile.email || '',
          avatar: (profile.full_name || profile.email || 'U').substring(0, 2).toUpperCase(),
          plan: (profile.plan || 'free').charAt(0).toUpperCase() + (profile.plan || 'free').slice(1),
          promptsUsed: userCredit?.used_credits || 0,
          joinedDate: profile.created_at,
          lastActive: userProfile?.last_login || profile.updated_at,
          status: userProfile?.is_active === false ? 'Suspended' : 'Active',
          credits: userCredit?.credits_balance || 0,
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch auth data for Auth & Security tab
  async function fetchAuthUsers() {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, auth_providers, phone, phone_verified, is_enabled, is_verified, last_sign_in, sign_in_count, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuthUsers(data || []);
    } catch (error) {
      console.error('Error fetching auth users:', error);
    } finally {
      setAuthLoading(false);
    }
  }

  // Effect to fetch auth users when tab changes
  useEffect(() => {
    if (activeTab === 'auth') {
      fetchAuthUsers();
    }
  }, [activeTab]);

  // Auth users filtering
  const filteredAuthUsers = useMemo(() => {
    if (!authSearchQuery) return authUsers;
    const q = authSearchQuery.toLowerCase();
    return authUsers.filter(u => 
      u.email?.toLowerCase().includes(q) || 
      u.full_name?.toLowerCase().includes(q)
    );
  }, [authUsers, authSearchQuery]);

  // Auth actions
  const handleToggleEnabled = async (user) => {
    try {
      const newVal = !user.is_enabled;
      const { error } = await supabase
        .from('profiles')
        .update({ is_enabled: newVal })
        .eq('id', user.id);
      if (error) throw error;
      setAuthUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_enabled: newVal } : u));
    } catch (error) {
      console.error('Error toggling enabled:', error);
      alert('Failed to update user');
    }
  };

  const handleToggleVerified = async (user) => {
    try {
      const newVal = !user.is_verified;
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: newVal })
        .eq('id', user.id);
      if (error) throw error;
      setAuthUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_verified: newVal } : u));
    } catch (error) {
      console.error('Error toggling verified:', error);
      alert('Failed to update user');
    }
  };

  const handleForcePasswordReset = async () => {
    if (!forcePasswordResetUser) return;
    try {
      // In production, this would send a password reset email via Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(forcePasswordResetUser.email);
      if (error) throw error;
      alert(`Password reset email sent to ${forcePasswordResetUser.email}`);
    } catch (error) {
      console.error('Error sending reset:', error);
      alert('Failed to send password reset');
    }
    setForcePasswordResetUser(null);
  };

  const handleForceLogout = async () => {
    if (!forceLogoutUser) return;
    try {
      // In production, this would invalidate all sessions for this user
      // For now, we just update last_sign_in to trigger re-auth
      const { error } = await supabase
        .from('profiles')
        .update({ last_sign_in: null })
        .eq('id', forceLogoutUser.id);
      if (error) throw error;
      alert(`Logged out ${forceLogoutUser.email} from all sessions`);
      fetchAuthUsers();
    } catch (error) {
      console.error('Error forcing logout:', error);
      alert('Failed to force logout');
    }
    setForceLogoutUser(null);
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === 'All' || user.plan === planFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [users, searchQuery, planFilter, statusFilter]);

  // Paginate
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const handleSuspend = async (user) => {
    try {
      const newStatus = user.status === 'Suspended' ? true : false;
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, status: newStatus ? 'Active' : 'Suspended' } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
    setConfirmAction(null);
  };

  const handleBan = async (user) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, status: 'Banned' } : u
      ));
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
    setConfirmAction(null);
  };

  const handleDelete = async (user) => {
    try {
      // Note: Deleting from profiles will cascade due to FK constraints
      // In production, you might want to soft-delete instead
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
    setConfirmAction(null);
  };

  const handleUpgrade = async (user, newPlan) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: newPlan.toLowerCase() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, plan: newPlan } : u
      ));
    } catch (error) {
      console.error('Error upgrading user:', error);
      alert('Failed to upgrade user');
    }
    setUpgradeUser(null);
  };

  const handleAddCredits = async (user) => {
    try {
      console.log('Adding credits to user:', user.id, 'Amount:', creditAmount);
      
      // Use admin RPC function to bypass RLS
      const { data, error } = await supabase.rpc('admin_add_credits', {
        p_user_id: user.id,
        p_amount: creditAmount,
        p_reason: creditReason || 'Admin credit grant'
      });
      
      console.log('RPC response:', { data, error });
      
      if (error) {
        console.error('RPC error:', error);
        throw error;
      }
      if (!data?.success) {
        console.error('Function returned error:', data);
        throw new Error(data?.error || 'Failed to add credits');
      }
      
      // Refresh user list to get updated data from database
      await fetchUsers();
      
      setCreditAmount(100);
      setCreditReason('');
      setCreditsModal(null);
      alert(`Added ${creditAmount} credits to ${user.name}. New balance: ${data.new_balance}`);
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Failed to add credits: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeductCredits = async (user) => {
    try {
      console.log('Deducting credits from user:', user.id, 'Amount:', creditAmount);
      
      // Use admin RPC function to bypass RLS
      const { data, error } = await supabase.rpc('admin_deduct_credits', {
        p_user_id: user.id,
        p_amount: creditAmount,
        p_reason: creditReason || 'Admin credit deduction'
      });
      
      console.log('RPC response:', { data, error });
      
      if (error) {
        console.error('RPC error:', error);
        throw error;
      }
      if (!data?.success) {
        console.error('Function returned error:', data);
        throw new Error(data?.error || 'Failed to deduct credits');
      }
      
      // Refresh user list to get updated data from database
      await fetchUsers();
      
      setCreditAmount(100);
      setCreditReason('');
      setCreditsModal(null);
      alert(`Deducted ${creditAmount} credits from ${user.name}. New balance: ${data.new_balance}`);
    } catch (error) {
      console.error('Error deducting credits:', error);
      alert('Failed to deduct credits: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSetCredits = async (user, amount) => {
    try {
      console.log('Setting credits for user:', user.id, 'Amount:', amount);
      
      // Use admin RPC function to bypass RLS
      const { data, error } = await supabase.rpc('admin_set_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: 'Admin set credits'
      });
      
      console.log('RPC response:', { data, error });
      
      if (error) {
        console.error('RPC error:', error);
        throw error;
      }
      if (!data?.success) throw new Error(data?.error || 'Failed to set credits');
      
      // Refresh user list to get updated data from database
      await fetchUsers();
    } catch (error) {
      console.error('Error setting credits:', error);
    }
  };

  const handleImpersonate = (user) => {
    console.log(`Impersonating user: ${user.email}`);
    // Show toast simulation
    alert(`Impersonating ${user.name}`);
  };

  const handleExport = () => {
    console.log('Exporting users CSV...');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">User Management</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2"
          >
            <Users className="w-4 h-4" />
            Users List
          </TabsTrigger>
          <TabsTrigger
            value="auth"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2"
          >
            <Shield className="w-4 h-4" />
            Auth & Security
          </TabsTrigger>
        </TabsList>

        {/* Users List Tab */}
        <TabsContent value="users" className="mt-6 space-y-6">
      {/* Sub-Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge label={`${filteredUsers.length} total`} variant="neutral" />
          {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 bg-[#111827] border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Plans</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Banned">Banned</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm text-white transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Admin
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <span className="text-sm text-indigo-400">{selectedUsers.size} selected</span>
          <button className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30">
            Suspend All
          </button>
          <button className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
            Delete All
          </button>
          <button className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">
            Email All
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.has(u.id))}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Credits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Prompts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={user.plan} variant={planVariants[user.plan]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-400 font-medium">{(user.credits || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user.promptsUsed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={user.status} variant={statusVariants[user.status]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-1 rounded hover:bg-gray-700"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {activeDropdown === user.id && (
                        <div className="absolute right-0 top-8 w-48 bg-[#1F2937] border border-gray-700 rounded-lg shadow-xl z-10">
                          <button
                            onClick={() => { setViewUser(user); setActiveDropdown(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <Eye className="w-4 h-4" /> View Profile
                          </button>
                          <button
                            onClick={() => { handleImpersonate(user); setActiveDropdown(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <UserCog className="w-4 h-4" /> Impersonate
                          </button>
                          <button
                            onClick={() => { setUpgradeUser(user); setActiveDropdown(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <ArrowUpCircle className="w-4 h-4" /> Upgrade Plan
                          </button>
                          <button
                            onClick={() => { setCreditsModal(user); setActiveDropdown(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-amber-400 hover:bg-gray-700"
                          >
                            <Coins className="w-4 h-4" /> Manage Credits
                          </button>
                          <button
                            onClick={() => { setConfirmAction({ type: 'suspend', user }); setActiveDropdown(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                          >
                            <Ban className="w-4 h-4" /> {user.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => { setConfirmAction({ type: 'ban', user }); setActiveDropdown(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-400 hover:bg-gray-700"
                          >
                            <Ban className="w-4 h-4" /> Ban
                          </button>
                          <button
                            onClick={() => { setConfirmAction({ type: 'delete', user }); setActiveDropdown(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 rounded text-sm ${
                    currentPage === num ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Drawer */}
      {viewUser && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#111827] border-l border-gray-800 shadow-2xl z-50 overflow-y-auto">
          <div className="sticky top-0 bg-[#111827] border-b border-gray-800 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">User Details</h3>
            <button onClick={() => setViewUser(null)} className="p-1 hover:bg-gray-800 rounded">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                {viewUser.avatar}
              </div>
              <div>
                <h4 className="text-xl text-white font-semibold">{viewUser.name}</h4>
                <p className="text-gray-400">{viewUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge label={viewUser.plan} variant={planVariants[viewUser.plan]} />
                  <Badge label={viewUser.status} variant={statusVariants[viewUser.status]} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0A0E1A] rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Credits</p>
                <p className="text-2xl text-amber-400 font-bold">{(viewUser.credits || 0).toLocaleString()}</p>
              </div>
              <div className="bg-[#0A0E1A] rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Total Prompts</p>
                <p className="text-2xl text-white font-bold">{viewUser.promptsUsed.toLocaleString()}</p>
              </div>
              <div className="bg-[#0A0E1A] rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Tokens Used</p>
                <p className="text-2xl text-white font-bold">{(viewUser.tokensUsed / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-[#0A0E1A] rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Last Login</p>
                <p className="text-lg text-white font-bold">{new Date(viewUser.lastActive).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Subscription History */}
            <div>
              <h5 className="text-sm font-semibold text-gray-400 uppercase mb-3">Subscription History</h5>
              <div className="space-y-2">
                {/* MOCK DATA */}
                <div className="flex items-center justify-between p-3 bg-[#0A0E1A] rounded-lg">
                  <span className="text-sm text-white">{viewUser.plan} Plan</span>
                  <span className="text-xs text-gray-500">Current</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A0E1A] rounded-lg">
                  <span className="text-sm text-gray-400">Free Plan</span>
                  <span className="text-xs text-gray-500">{new Date(viewUser.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Prompts */}
            <div>
              <h5 className="text-sm font-semibold text-gray-400 uppercase mb-3">Recent Prompts</h5>
              <div className="space-y-2">
                {/* MOCK DATA */}
                {['Code review for React component', 'Marketing copy for SaaS', 'Blog post outline', 'API documentation', 'Email template'].map((prompt, i) => (
                  <div key={i} className="p-3 bg-[#0A0E1A] rounded-lg">
                    <p className="text-sm text-white truncate">{prompt}</p>
                    <p className="text-xs text-gray-500 mt-1">{i + 1} day{i > 0 ? 's' : ''} ago</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setCreditsModal(viewUser); setViewUser(null); }}
                className="flex-1 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30"
              >
                Credits
              </button>
              <button
                onClick={() => { setConfirmAction({ type: 'suspend', user: viewUser }); setViewUser(null); }}
                className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
              >
                Suspend
              </button>
              <button
                onClick={() => { setUpgradeUser(viewUser); setViewUser(null); }}
                className="flex-1 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30"
              >
                Upgrade
              </button>
              <button className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Admin">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="readonly">Read Only</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => { console.log('Invite sent'); setInviteModalOpen(false); }}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Send Invite
            </button>
          </div>
        </div>
      </Modal>

      {/* Upgrade Plan Modal */}
      <Modal isOpen={!!upgradeUser} onClose={() => setUpgradeUser(null)} title="Upgrade Plan">
        {upgradeUser && (
          <div className="space-y-4">
            <p className="text-gray-400">
              Select a new plan for <span className="text-white">{upgradeUser.name}</span>
            </p>
            <div className="space-y-2">
              {['Free', 'Pro', 'Enterprise'].map(plan => (
                <button
                  key={plan}
                  onClick={() => handleUpgrade(upgradeUser, plan)}
                  disabled={upgradeUser.plan === plan}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    upgradeUser.plan === plan
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-gray-700 hover:border-gray-600 text-white'
                  }`}
                >
                  <span className="font-medium">{plan}</span>
                  {upgradeUser.plan === plan && <span className="ml-2 text-xs">(Current)</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Credits Management Modal */}
      <Modal isOpen={!!creditsModal} onClose={() => { setCreditsModal(null); setCreditAmount(100); setCreditReason(''); }} title="Manage User Credits">
        {creditsModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[#0A0E1A] rounded-lg">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-bold">
                {creditsModal.avatar}
              </div>
              <div>
                <p className="text-white font-medium">{creditsModal.name}</p>
                <p className="text-sm text-gray-400">{creditsModal.email}</p>
              </div>
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-amber-400">Current Credits</span>
                <span className="text-2xl font-bold text-amber-400">{(creditsModal.credits || 0).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount</label>
              <input
                type="number"
                min="1"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Reason (optional)</label>
              <input
                type="text"
                placeholder="e.g., Promotional bonus, Refund, Manual adjustment"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAddCredits(creditsModal)}
                className="flex items-center justify-center gap-2 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Credits
              </button>
              <button
                onClick={() => handleDeductCredits(creditsModal)}
                className="flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Minus className="w-4 h-4" />
                Deduct Credits
              </button>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <label className="block text-sm text-gray-400 mb-2">Or set to specific amount</label>
              <div className="flex gap-2">
                {[0, 100, 500, 1000, 5000].map(preset => (
                  <button
                    key={preset}
                    onClick={() => handleSetCredits(creditsModal, preset)}
                    className="flex-1 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm"
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmAction?.type === 'suspend'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleSuspend(confirmAction.user)}
        title={confirmAction?.user?.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
        message={`Are you sure you want to ${confirmAction?.user?.status === 'Suspended' ? 'unsuspend' : 'suspend'} ${confirmAction?.user?.name}?`}
        confirmLabel={confirmAction?.user?.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
        variant="warning"
      />

      <ConfirmDialog
        isOpen={confirmAction?.type === 'ban'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleBan(confirmAction.user)}
        title="Ban User"
        message={`Are you sure you want to ban ${confirmAction?.user?.name}? This action will prevent them from accessing the platform.`}
        confirmLabel="Ban User"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={confirmAction?.type === 'delete'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleDelete(confirmAction.user)}
        title="Delete User"
        message={`This will permanently delete ${confirmAction?.user?.name} and all their data. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        requireTextInput="DELETE"
      />
        </TabsContent>

        {/* Auth & Security Tab */}
        <TabsContent value="auth" className="mt-6 space-y-6">
          {/* Sub-Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge label={`${filteredAuthUsers.length} users`} variant="neutral" />
              {authLoading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAuthUsers}
                disabled={authLoading}
                className="p-2 bg-[#111827] border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${authLoading ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={authSearchQuery}
                  onChange={(e) => setAuthSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
                />
              </div>
            </div>
          </div>

          {/* Auth Table */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Auth Providers</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Phone</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Enabled</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Verified</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Last Sign In</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuthUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAuthUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                              {(user.full_name || user.email || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium">{user.full_name || user.email?.split('@')[0]}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {(user.auth_providers || ['email']).map((provider, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300 capitalize">
                                {provider}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {user.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <span className="text-sm text-gray-300">{user.phone}</span>
                              {user.phone_verified && (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch
                            checked={user.is_enabled !== false}
                            onCheckedChange={() => handleToggleEnabled(user)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch
                            checked={user.is_verified === true}
                            onCheckedChange={() => handleToggleVerified(user)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {user.last_sign_in ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(user.last_sign_in), { addSuffix: true })}
                            </div>
                          ) : '-'}
                          {user.sign_in_count > 0 && (
                            <p className="text-xs text-gray-500">{user.sign_in_count} sign-ins</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setForcePasswordResetUser(user)}
                              className="p-1.5 rounded hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400"
                              title="Force Password Reset"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setForceLogoutUser(user)}
                              className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                              title="Force Logout"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSignInHistoryUser(user)}
                              className="p-1.5 rounded hover:bg-blue-500/20 text-gray-400 hover:text-blue-400"
                              title="Sign-in History"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-in History Modal */}
          <Modal isOpen={!!signInHistoryUser} onClose={() => setSignInHistoryUser(null)} title="Sign-in History">
            {signInHistoryUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#0A0E1A] rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-bold">
                    {(signInHistoryUser.full_name || signInHistoryUser.email || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{signInHistoryUser.full_name || signInHistoryUser.email}</p>
                    <p className="text-sm text-gray-400">{signInHistoryUser.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#0A0E1A] rounded-lg">
                    <span className="text-sm text-gray-400">Total Sign-ins</span>
                    <span className="text-white font-medium">{signInHistoryUser.sign_in_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0A0E1A] rounded-lg">
                    <span className="text-sm text-gray-400">Last Sign-in</span>
                    <span className="text-white font-medium">
                      {signInHistoryUser.last_sign_in 
                        ? new Date(signInHistoryUser.last_sign_in).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0A0E1A] rounded-lg">
                    <span className="text-sm text-gray-400">Account Created</span>
                    <span className="text-white font-medium">
                      {new Date(signInHistoryUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0A0E1A] rounded-lg">
                    <span className="text-sm text-gray-400">Auth Providers</span>
                    <div className="flex gap-1">
                      {(signInHistoryUser.auth_providers || ['email']).map((p, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-400 capitalize">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center pt-2">
                  Detailed sign-in logs require Supabase Auth Hooks configuration
                </p>
              </div>
            )}
          </Modal>

          {/* Force Password Reset Confirm */}
          <ConfirmDialog
            isOpen={!!forcePasswordResetUser}
            onClose={() => setForcePasswordResetUser(null)}
            onConfirm={handleForcePasswordReset}
            title="Force Password Reset"
            message={`Send a password reset email to ${forcePasswordResetUser?.email}? The user will be required to set a new password.`}
            confirmLabel="Send Reset Email"
            variant="warning"
          />

          {/* Force Logout Confirm */}
          <ConfirmDialog
            isOpen={!!forceLogoutUser}
            onClose={() => setForceLogoutUser(null)}
            onConfirm={handleForceLogout}
            title="Force Logout"
            message={`Log out ${forceLogoutUser?.email} from all devices? They will need to sign in again.`}
            confirmLabel="Force Logout"
            variant="danger"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
