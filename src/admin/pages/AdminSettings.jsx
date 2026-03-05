import React, { useState } from 'react';
import {
  User,
  Shield,
  Users,
  Settings,
  Webhook,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Lock,
  Globe,
  Bell,
  Database,
  Trash2,
  Plus,
  Check,
  RefreshCw,
  Copy,
  ExternalLink,
  Download,
  Loader2,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { supabase } from '../../lib/supabase';

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  // Danger Zone state
  const [dangerAction, setDangerAction] = useState(null); // 'cache' | 'sessions' | 'export'
  const [dangerLoading, setDangerLoading] = useState(null);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);

  // Danger Zone handlers
  const handleClearCache = async () => {
    setDangerLoading('cache');
    try {
      // Clear all localStorage cache items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('cache') || key.includes('prompt_history') || key.includes('chat_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage too
      sessionStorage.clear();
      
      alert(`Cache cleared successfully! Removed ${keysToRemove.length} cached items.`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache: ' + error.message);
    } finally {
      setDangerLoading(null);
      setShowDangerConfirm(false);
    }
  };

  const handleResetSessions = async () => {
    setDangerLoading('sessions');
    try {
      // Sign out all users via Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear all auth-related localStorage
      const authKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('session') || key.includes('token') || key.includes('supabase'))) {
          authKeys.push(key);
        }
      }
      authKeys.forEach(key => localStorage.removeItem(key));
      
      alert('All user sessions have been reset. Users will need to log in again.');
    } catch (error) {
      console.error('Error resetting sessions:', error);
      alert('Failed to reset sessions: ' + error.message);
    } finally {
      setDangerLoading(null);
      setShowDangerConfirm(false);
    }
  };

  const handleExportData = async () => {
    setDangerLoading('export');
    try {
      // Fetch all data from Supabase
      const [promptsResult, chatsResult, usersResult, creditsResult] = await Promise.all([
        supabase.from('prompt_history').select('*').order('created_at', { ascending: false }),
        supabase.from('chat_conversations').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('user_credits').select('*'),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        promptHistory: promptsResult.data || [],
        chatConversations: chatsResult.data || [],
        profiles: usersResult.data || [],
        userCredits: creditsResult.data || [],
        stats: {
          totalPrompts: (promptsResult.data || []).length,
          totalChats: (chatsResult.data || []).length,
          totalUsers: (usersResult.data || []).length,
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptxgen-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Data exported successfully! ${exportData.stats.totalPrompts} prompts, ${exportData.stats.totalChats} chats, ${exportData.stats.totalUsers} users.`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data: ' + error.message);
    } finally {
      setDangerLoading(null);
      setShowDangerConfirm(false);
    }
  };

  const executeDangerAction = () => {
    switch (dangerAction) {
      case 'cache':
        handleClearCache();
        break;
      case 'sessions':
        handleResetSessions();
        break;
      case 'export':
        handleExportData();
        break;
    }
  };

  const getDangerActionConfig = () => {
    switch (dangerAction) {
      case 'cache':
        return {
          title: 'Clear All Cache',
          message: 'This will purge all cached data across the platform. This action cannot be undone.',
          confirmLabel: 'Clear Cache',
        };
      case 'sessions':
        return {
          title: 'Reset All User Sessions',
          message: 'This will force all users to log in again. All active sessions will be terminated immediately.',
          confirmLabel: 'Reset Sessions',
        };
      case 'export':
        return {
          title: 'Export All Data',
          message: 'This will download a complete backup of all platform data including prompts, chats, and user information.',
          confirmLabel: 'Export Data',
          variant: 'warning',
        };
      default:
        return {};
    }
  };

  // MOCK DATA - Profile
  const [profile, setProfile] = useState({
    name: 'Super Admin',
    email: 'admin@askjai.com',
    avatar: '',
    timezone: 'UTC',
    language: 'en',
  });

  // MOCK DATA - Security
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 8,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    lastPasswordChange: '2024-01-15',
  });

  // Admin Team - Only main admin
  const [admins, setAdmins] = useState([
    { id: 1, name: 'Super Admin', email: 'admin@askjai.com', role: 'Super Admin', lastLogin: new Date().toISOString(), status: 'Active' },
  ]);

  // MOCK DATA - App Config
  const [appConfig, setAppConfig] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    maxPromptsPerDay: 100,
    defaultPlan: 'free',
    supportEmail: 'support@askjai.com',
  });

  // MOCK DATA - Webhooks
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: 'Slack Notifications', url: 'https://hooks.slack.com/services/xxx', events: ['user.created', 'payment.completed'], status: 'Active' },
    { id: 2, name: 'Analytics', url: 'https://analytics.example.com/webhook', events: ['prompt.generated'], status: 'Active' },
  ]);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Invite form
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Admin',
  });

  // Webhook form
  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: [],
  });

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'team', label: 'Admin Team', icon: Users },
    { id: 'app', label: 'App Config', icon: Settings },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  const handleSave = () => {
    console.log('Saving settings...', { profile, security, appConfig });
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Passwords do not match');
      return;
    }
    console.log('Changing password...');
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    alert('Password changed successfully!');
  };

  const handleInviteAdmin = () => {
    const newAdmin = {
      id: admins.length + 1,
      name: 'Pending User',
      email: inviteForm.email,
      role: inviteForm.role,
      lastLogin: null,
      status: 'Pending',
    };
    setAdmins([...admins, newAdmin]);
    setInviteForm({ email: '', role: 'Admin' });
    setShowInviteModal(false);
    alert(`Invitation sent to ${newAdmin.email}`);
  };

  const handleAddWebhook = () => {
    const newWebhook = {
      id: webhooks.length + 1,
      ...webhookForm,
      status: 'Active',
    };
    setWebhooks([...webhooks, newWebhook]);
    setWebhookForm({ name: '', url: '', events: [] });
    setShowWebhookModal(false);
  };

  const handleDeleteAdmin = () => {
    setAdmins(admins.filter(a => a.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                <p className="text-gray-400">{profile.email}</p>
                <button className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
                  Change Avatar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => { setProfile({ ...profile, name: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => { setProfile({ ...profile, email: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => { setProfile({ ...profile, timezone: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Language</label>
                <select
                  value={profile.language}
                  onChange={(e) => { setProfile({ ...profile, language: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Password */}
            <div className="bg-[#0A0E1A] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="text-white font-medium">Password</h4>
                    <p className="text-sm text-gray-500">Last changed: {security.lastPasswordChange}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div className="bg-[#0A0E1A] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled }); setHasChanges(true); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    security.twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    security.twoFactorEnabled ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Session Timeout */}
            <div className="bg-[#0A0E1A] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="text-white font-medium">Session Timeout</h4>
                    <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                  </div>
                </div>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => { setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) }); setHasChanges(true); }}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none"
                >
                  <option value="1">1 hour</option>
                  <option value="4">4 hours</option>
                  <option value="8">8 hours</option>
                  <option value="24">24 hours</option>
                </select>
              </div>
            </div>

            {/* IP Whitelist */}
            <div className="bg-[#0A0E1A] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="text-white font-medium">IP Whitelist</h4>
                    <p className="text-sm text-gray-500">Restrict admin access to specific IPs</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {security.ipWhitelist.map((ip, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-800 rounded text-sm text-gray-300 font-mono">{ip}</code>
                    <button className="text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
                  <Plus className="w-4 h-4" />
                  Add IP Address
                </button>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
              >
                <Plus className="w-4 h-4" />
                Invite Admin
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id} className="border-b border-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          label={admin.role} 
                          variant={admin.role === 'Super Admin' ? 'purple' : 'info'} 
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          label={admin.status} 
                          variant={admin.status === 'Active' ? 'success' : 'warning'} 
                        />
                      </td>
                      <td className="px-4 py-3">
                        {admin.role !== 'Super Admin' && (
                          <button
                            onClick={() => setConfirmDelete(admin)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'app':
        return (
          <div className="space-y-6">
            {/* Maintenance Mode */}
            <div className="bg-[#0A0E1A] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="text-white font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">Temporarily disable public access</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAppConfig({ ...appConfig, maintenanceMode: !appConfig.maintenanceMode }); setHasChanges(true); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    appConfig.maintenanceMode ? 'bg-amber-500' : 'bg-gray-700'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    appConfig.maintenanceMode ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Registration */}
            <div className="bg-[#0A0E1A] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="text-white font-medium">User Registration</h4>
                    <p className="text-sm text-gray-500">Allow new users to sign up</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAppConfig({ ...appConfig, registrationEnabled: !appConfig.registrationEnabled }); setHasChanges(true); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    appConfig.registrationEnabled ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    appConfig.registrationEnabled ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Other Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Prompts Per Day (Free)</label>
                <input
                  type="number"
                  value={appConfig.maxPromptsPerDay}
                  onChange={(e) => { setAppConfig({ ...appConfig, maxPromptsPerDay: parseInt(e.target.value) }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Plan</label>
                <select
                  value={appConfig.defaultPlan}
                  onChange={(e) => { setAppConfig({ ...appConfig, defaultPlan: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Support Email</label>
                <input
                  type="email"
                  value={appConfig.supportEmail}
                  onChange={(e) => { setAppConfig({ ...appConfig, supportEmail: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        );

      case 'webhooks':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowWebhookModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
              >
                <Plus className="w-4 h-4" />
                Add Webhook
              </button>
            </div>

            <div className="space-y-3">
              {webhooks.map(webhook => (
                <div key={webhook.id} className="bg-[#0A0E1A] border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Webhook className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-white font-medium">{webhook.name}</h4>
                      <Badge label={webhook.status} variant={webhook.status === 'Active' ? 'success' : 'neutral'} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-white">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm text-gray-400 font-mono truncate">{webhook.url}</code>
                    <button className="text-gray-500 hover:text-gray-300">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map(event => (
                      <Badge key={event} label={event} variant="neutral" size="sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="text-red-400 font-semibold">Danger Zone</h4>
              </div>
              <p className="text-sm text-red-300 mb-4">
                These actions are destructive and cannot be undone. Please proceed with caution.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <h5 className="text-white font-medium">Clear All Cache</h5>
                    <p className="text-sm text-gray-500">Purge all cached data across the platform</p>
                  </div>
                  <button 
                    onClick={() => { setDangerAction('cache'); setShowDangerConfirm(true); }}
                    disabled={dangerLoading === 'cache'}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 disabled:opacity-50 flex items-center gap-2"
                  >
                    {dangerLoading === 'cache' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Clear Cache
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <h5 className="text-white font-medium">Reset All User Sessions</h5>
                    <p className="text-sm text-gray-500">Force all users to log in again</p>
                  </div>
                  <button 
                    onClick={() => { setDangerAction('sessions'); setShowDangerConfirm(true); }}
                    disabled={dangerLoading === 'sessions'}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 disabled:opacity-50 flex items-center gap-2"
                  >
                    {dangerLoading === 'sessions' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Reset Sessions
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <h5 className="text-white font-medium">Export All Data</h5>
                    <p className="text-sm text-gray-500">Download complete platform data backup</p>
                  </div>
                  <button 
                    onClick={() => { setDangerAction('export'); setShowDangerConfirm(true); }}
                    disabled={dangerLoading === 'export'}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 disabled:opacity-50 flex items-center gap-2"
                  >
                    {dangerLoading === 'export' && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
          </div>

          {renderSection()}
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 pr-10"
              />
              <button
                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 pr-10"
              />
              <button
                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Change Password
            </button>
          </div>
        </div>
      </Modal>

      {/* Invite Admin Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Admin">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Admin">Admin</option>
              <option value="Support">Support</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowInviteModal(false)}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteAdmin}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Send Invite
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Webhook Modal */}
      <Modal isOpen={showWebhookModal} onClose={() => setShowWebhookModal(false)} title="Add Webhook">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name</label>
            <input
              type="text"
              value={webhookForm.name}
              onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
              placeholder="e.g., Slack Notification"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">URL</label>
            <input
              type="url"
              value={webhookForm.url}
              onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {['user.created', 'user.deleted', 'prompt.generated', 'payment.completed', 'payment.failed'].map(event => (
                <button
                  key={event}
                  onClick={() => setWebhookForm({
                    ...webhookForm,
                    events: webhookForm.events.includes(event)
                      ? webhookForm.events.filter(e => e !== event)
                      : [...webhookForm.events, event]
                  })}
                  className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                    webhookForm.events.includes(event)
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowWebhookModal(false)}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWebhook}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Add Webhook
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Admin Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteAdmin}
        title="Remove Admin"
        message={`Are you sure you want to remove ${confirmDelete?.name} from the admin team?`}
        confirmLabel="Remove"
        variant="danger"
      />

      {/* Danger Zone Confirmation */}
      <ConfirmDialog
        isOpen={showDangerConfirm}
        onClose={() => { setShowDangerConfirm(false); setDangerAction(null); }}
        onConfirm={executeDangerAction}
        title={getDangerActionConfig().title}
        message={getDangerActionConfig().message}
        confirmLabel={getDangerActionConfig().confirmLabel}
        variant={getDangerActionConfig().variant || 'danger'}
      />
    </div>
  );
}
