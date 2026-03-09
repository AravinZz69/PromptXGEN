import React, { useState } from 'react';
import {
  User,
  Users,
  Shield,
  Settings,
  Webhook,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Key,
  Lock,
  Bell,
  Database,
  Trash2,
  Plus,
  Check,
  RefreshCw,
  Copy,
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
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
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

  // Profile - load from Supabase on mount
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    timezone: 'UTC',
    language: 'en',
  });

  // Load admin profile from DB
  React.useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single();
      
      setProfile(prev => ({
        ...prev,
        name: profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
        email: profileData?.email || user.email || '',
      }));
    }
    loadProfile();
  }, []);

  // Security settings
  const [security, setSecurity] = useState({
    sessionTimeout: 8,
    lastPasswordChange: 'Not tracked',
  });


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
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
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
    { id: 'app', label: 'App Config', icon: Settings },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  const handleSave = async () => {
    setProfileLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.name,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Also update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: profile.name },
      });

      setHasChanges(false);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    
    if (!passwordForm.current) {
      setPasswordError('Current password is required');
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      // Verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user session');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.current,
      });

      if (signInError) {
        setPasswordError('Current password is incorrect');
        setPasswordLoading(false);
        return;
      }

      // Update password via Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (updateError) throw updateError;

      // Log the password change in audit
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: 0,
        transaction_type: 'reset',
        description: 'Admin password changed',
      });

      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setPasswordError('');
      setSecurity(prev => ({ ...prev, lastPasswordChange: new Date().toISOString().split('T')[0] }));
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };


  const handleAddWebhook = () => {
    if (!webhookForm.name || !webhookForm.url || webhookForm.events.length === 0) {
      alert('Please fill in all fields and select at least one event.');
      return;
    }
    const newWebhook = {
      id: Date.now(),
      ...webhookForm,
      status: 'Active',
    };
    setWebhooks([...webhooks, newWebhook]);
    setWebhookForm({ name: '', url: '', events: [] });
    setShowWebhookModal(false);
    alert(`Webhook "${newWebhook.name}" added successfully!`);
  };


  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                <p className="text-muted-foreground">{profile.email}</p>
                <button className="mt-2 text-sm text-primary hover:text-indigo-300">
                  Change Avatar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => { setProfile({ ...profile, name: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => { setProfile({ ...profile, email: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => { setProfile({ ...profile, timezone: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Language</label>
                <select
                  value={profile.language}
                  onChange={(e) => { setProfile({ ...profile, language: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
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
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="text-foreground font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">Last changed: {security.lastPasswordChange}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Session Timeout */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="text-foreground font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                  </div>
                </div>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => { setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) }); setHasChanges(true); }}
                  className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none"
                >
                  <option value="1">1 hour</option>
                  <option value="4">4 hours</option>
                  <option value="8">8 hours</option>
                  <option value="24">24 hours</option>
                </select>
              </div>
            </div>
          </div>
        );


      case 'app':
        return (
          <div className="space-y-6">
            {/* Maintenance Mode */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="text-white font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAppConfig({ ...appConfig, maintenanceMode: !appConfig.maintenanceMode }); setHasChanges(true); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    appConfig.maintenanceMode ? 'bg-amber-500' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    appConfig.maintenanceMode ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Registration */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="text-white font-medium">User Registration</h4>
                    <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAppConfig({ ...appConfig, registrationEnabled: !appConfig.registrationEnabled }); setHasChanges(true); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    appConfig.registrationEnabled ? 'bg-emerald-500' : 'bg-muted'
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
                <label className="block text-sm text-muted-foreground mb-2">Max Prompts Per Day (Free)</label>
                <input
                  type="number"
                  value={appConfig.maxPromptsPerDay}
                  onChange={(e) => { setAppConfig({ ...appConfig, maxPromptsPerDay: parseInt(e.target.value) }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Default Plan</label>
                <select
                  value={appConfig.defaultPlan}
                  onChange={(e) => { setAppConfig({ ...appConfig, defaultPlan: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-2">Support Email</label>
                <input
                  type="email"
                  value={appConfig.supportEmail}
                  onChange={(e) => { setAppConfig({ ...appConfig, supportEmail: e.target.value }); setHasChanges(true); }}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
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
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Add Webhook
              </button>
            </div>

            <div className="space-y-3">
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No webhooks configured yet.</p>
                  <p className="text-sm">Add a webhook to receive real-time notifications.</p>
                </div>
              ) : (
                webhooks.map(webhook => (
                  <div key={webhook.id} className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Webhook className="w-5 h-5 text-primary" />
                        <h4 className="text-foreground font-medium">{webhook.name}</h4>
                        <Badge label={webhook.status} variant={webhook.status === 'Active' ? 'success' : 'neutral'} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setWebhooks(webhooks.map(w => 
                              w.id === webhook.id 
                                ? { ...w, status: w.status === 'Active' ? 'Paused' : 'Active' }
                                : w
                            ));
                          }}
                          className="text-muted-foreground hover:text-foreground"
                          title={webhook.status === 'Active' ? 'Pause webhook' : 'Activate webhook'}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setWebhooks(webhooks.filter(w => w.id !== webhook.id))}
                          className="text-muted-foreground hover:text-red-400"
                          title="Delete webhook"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm text-muted-foreground font-mono truncate flex-1">{webhook.url}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(webhook.url);
                          alert('URL copied to clipboard!');
                        }}
                        className="text-muted-foreground hover:text-foreground"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map(event => (
                        <Badge key={event} label={event} variant="neutral" size="sm" />
                      ))}
                    </div>
                  </div>
                ))
              )}
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
                    <p className="text-sm text-muted-foreground">Purge all cached data across the platform</p>
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
                    <p className="text-sm text-muted-foreground">Force all users to log in again</p>
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
                    <p className="text-sm text-muted-foreground">Download complete platform data backup</p>
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
        <div className="bg-card border border-border rounded-xl p-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-white'
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
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary"
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
            <label className="block text-sm text-muted-foreground mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary pr-10"
              />
              <button
                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary pr-10"
              />
              <button
                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          {passwordError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{passwordError}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters. This updates your Supabase auth password.
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => { setShowPasswordModal(false); setPasswordError(''); }}
              disabled={passwordLoading}
              className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </div>
      </Modal>


      {/* Add Webhook Modal */}
      <Modal isOpen={showWebhookModal} onClose={() => setShowWebhookModal(false)} title="Add Webhook">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Name</label>
            <input
              type="text"
              value={webhookForm.name}
              onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
              placeholder="e.g., Slack Notification"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">URL</label>
            <input
              type="url"
              value={webhookForm.url}
              onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Events</label>
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
                      ? 'bg-primary/20 border-indigo-500 text-primary'
                      : 'bg-muted border-border text-muted-foreground'
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
              className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWebhook}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary"
            >
              Add Webhook
            </button>
          </div>
        </div>
      </Modal>


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
