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
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { supabase } from '@/lib/supabase';

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

  const pageSize = 10;

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Fetch profiles with credits
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch credits for all users
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, credits_balance, used_credits');

      // Fetch user_profiles for status
      const { data: userProfiles, error: upError } = await supabase
        .from('user_profiles')
        .select('user_id, is_active, last_login');

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
      // First get current credits
      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      const newBalance = (currentCredits?.credits_balance || 0) + creditAmount;
      
      // Update or insert credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          credits_balance: newBalance,
          total_credits: newBalance,
        }, { onConflict: 'user_id' });
      
      if (updateError) throw updateError;
      
      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: creditAmount,
        transaction_type: 'admin_grant',
        description: creditReason || 'Admin credit grant',
      });
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, credits: newBalance } : u
      ));
      setCreditAmount(100);
      setCreditReason('');
      setCreditsModal(null);
      alert(`Added ${creditAmount} credits to ${user.name}`);
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Failed to add credits');
    }
  };

  const handleDeductCredits = async (user) => {
    try {
      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newBalance = Math.max(0, (currentCredits?.credits_balance || 0) - creditAmount);
      
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ credits_balance: newBalance })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: creditAmount,
        transaction_type: 'deduction',
        description: creditReason || 'Admin credit deduction',
      });
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, credits: newBalance } : u
      ));
      setCreditAmount(100);
      setCreditReason('');
      setCreditsModal(null);
      alert(`Deducted ${creditAmount} credits from ${user.name}`);
    } catch (error) {
      console.error('Error deducting credits:', error);
      alert('Failed to deduct credits');
    }
  };

  const handleSetCredits = async (user, amount) => {
    try {
      const { error } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          credits_balance: amount,
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, credits: amount } : u
      ));
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Users</h2>
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
    </div>
  );
}
