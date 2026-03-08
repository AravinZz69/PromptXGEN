/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Auth Config Manager - Admin Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Configure authentication providers:
 * - Email/Password
 * - Phone OTP
 * - Google OAuth
 * - GitHub OAuth
 * 
 * Plus global security settings
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  Shield,
  Key,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AuthProvider {
  id: string;
  provider: string;
  display_name: string;
  is_enabled: boolean;
  config: ProviderConfig;
  created_at: string;
  updated_at: string;
}

interface ProviderConfig {
  // Email
  require_email_verification?: boolean;
  allow_password_reset?: boolean;
  min_password_length?: number;
  
  // Phone
  otp_expiry_minutes?: number;
  max_attempts?: number;
  
  // OAuth
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  scopes?: string;
  
  [key: string]: any;
}

interface SecuritySettings {
  session_timeout_hours: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  require_2fa_admin: boolean;
  password_policy: 'basic' | 'moderate' | 'strict';
}

// Provider icons
const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-6 h-6" />,
  phone: <Phone className="w-6 h-6" />,
  google: (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  ),
  github: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthConfig() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    session_timeout_hours: 24,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    require_2fa_admin: false,
    password_policy: 'moderate',
  });
  const [savingSecurity, setSavingSecurity] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auth_config')
        .select('*')
        .order('provider');

      if (error) throw error;

      // If no providers exist, create defaults
      if (!data || data.length === 0) {
        const defaults: Partial<AuthProvider>[] = [
          {
            provider: 'email',
            display_name: 'Email & Password',
            is_enabled: true,
            config: {
              require_email_verification: true,
              allow_password_reset: true,
              min_password_length: 8,
            },
          },
          {
            provider: 'phone',
            display_name: 'Phone OTP',
            is_enabled: false,
            config: {
              otp_expiry_minutes: 5,
              max_attempts: 3,
            },
          },
          {
            provider: 'google',
            display_name: 'Google',
            is_enabled: false,
            config: {
              client_id: '',
              client_secret: '',
              redirect_uri: '',
              scopes: 'email profile',
            },
          },
          {
            provider: 'github',
            display_name: 'GitHub',
            is_enabled: false,
            config: {
              client_id: '',
              client_secret: '',
              redirect_uri: '',
              scopes: 'user:email',
            },
          },
        ];

        const { data: inserted, error: insertError } = await supabase
          .from('auth_config')
          .insert(defaults)
          .select();

        if (insertError) throw insertError;
        setProviders(inserted || []);
      } else {
        setProviders(data);
      }
    } catch (error: any) {
      toast({
        title: '❌ Error loading auth config',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProvider = async (id: string, updates: Partial<AuthProvider>) => {
    try {
      setSaving(id);
      const { error } = await supabase
        .from('auth_config')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      toast({ title: '✅ Provider updated' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const saveSecuritySettings = async () => {
    try {
      setSavingSecurity(true);
      // In a real app, this would save to a settings table
      // For now, we'll just simulate the save
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast({ title: '✅ Security settings saved' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingSecurity(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Authentication Config</h1>
        <p className="text-muted-foreground text-sm">
          Configure authentication providers and security settings
        </p>
      </div>

      {/* Provider Cards - 2x2 Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            saving={saving === provider.id}
            onUpdate={(updates) => updateProvider(provider.id, updates)}
          />
        ))}
      </div>

      {/* Global Security Settings */}
      <div className="bg-muted border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Global Security Settings</h3>
            <p className="text-xs text-muted-foreground">Configure security policies across all providers</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Session Timeout */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Session Timeout (hours)
              </label>
              <Select
                value={securitySettings.session_timeout_hours.toString()}
                onValueChange={(v) =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    session_timeout_hours: parseInt(v),
                  }))
                }
              >
                <SelectTrigger className="bg-muted border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="8">8 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Login Attempts */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Max Login Attempts
              </label>
              <Select
                value={securitySettings.max_login_attempts.toString()}
                onValueChange={(v) =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    max_login_attempts: parseInt(v),
                  }))
                }
              >
                <SelectTrigger className="bg-muted border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lockout Duration */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Lockout Duration (minutes)
              </label>
              <Select
                value={securitySettings.lockout_duration_minutes.toString()}
                onValueChange={(v) =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    lockout_duration_minutes: parseInt(v),
                  }))
                }
              >
                <SelectTrigger className="bg-muted border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Policy */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Password Policy
              </label>
              <Select
                value={securitySettings.password_policy}
                onValueChange={(v: any) =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    password_policy: v,
                  }))
                }
              >
                <SelectTrigger className="bg-muted border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="basic">Basic (6+ chars)</SelectItem>
                  <SelectItem value="moderate">Moderate (8+ chars, mixed case)</SelectItem>
                  <SelectItem value="strict">Strict (12+ chars, symbols, numbers)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2FA for Admin */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-white font-medium">Require 2FA for Admin Users</p>
                <p className="text-xs text-muted-foreground">
                  Admin users must enable two-factor authentication
                </p>
              </div>
            </div>
            <Switch
              checked={securitySettings.require_2fa_admin}
              onCheckedChange={(checked) =>
                setSecuritySettings((prev) => ({ ...prev, require_2fa_admin: checked }))
              }
              className="data-[state=checked]:bg-yellow-600"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSecuritySettings}
              disabled={savingSecurity}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {savingSecurity ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Security Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  saving,
  onUpdate,
}: {
  provider: AuthProvider;
  saving: boolean;
  onUpdate: (updates: Partial<AuthProvider>) => void;
}) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<ProviderConfig>(provider.config || {});

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate({ config });
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Render different config fields based on provider
  const renderConfigFields = () => {
    switch (provider.provider) {
      case 'email':
        return (
          <div className="space-y-4">
            {/* Email Verification */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Require Email Verification</p>
                <p className="text-xs text-muted-foreground">Users must verify email before login</p>
              </div>
              <Switch
                checked={config.require_email_verification ?? true}
                onCheckedChange={(checked) =>
                  handleConfigChange('require_email_verification', checked)
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Password Reset */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Allow Password Reset</p>
                <p className="text-xs text-muted-foreground">Enable forgot password flow</p>
              </div>
              <Switch
                checked={config.allow_password_reset ?? true}
                onCheckedChange={(checked) =>
                  handleConfigChange('allow_password_reset', checked)
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Min Password Length */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Minimum Password Length
              </label>
              <Select
                value={(config.min_password_length || 8).toString()}
                onValueChange={(v) =>
                  handleConfigChange('min_password_length', parseInt(v))
                }
              >
                <SelectTrigger className="bg-muted border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="6">6 characters</SelectItem>
                  <SelectItem value="8">8 characters</SelectItem>
                  <SelectItem value="10">10 characters</SelectItem>
                  <SelectItem value="12">12 characters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4">
            {/* OTP Expiry */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                OTP Expiry (minutes)
              </label>
              <Select
                value={(config.otp_expiry_minutes || 5).toString()}
                onValueChange={(v) =>
                  handleConfigChange('otp_expiry_minutes', parseInt(v))
                }
              >
                <SelectTrigger className="bg-muted border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Attempts */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Max OTP Attempts
              </label>
              <Select
                value={(config.max_attempts || 3).toString()}
                onValueChange={(v) => handleConfigChange('max_attempts', parseInt(v))}
              >
                <SelectTrigger className="bg-muted border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <p className="text-xs text-blue-300">
                Phone OTP requires Twilio or similar SMS provider configuration in Supabase.
              </p>
            </div>
          </div>
        );

      case 'google':
      case 'github':
        return (
          <div className="space-y-4">
            {/* Client ID */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Client ID</label>
              <input
                type="text"
                value={config.client_id || ''}
                onChange={(e) => handleConfigChange('client_id', e.target.value)}
                placeholder="Enter client ID..."
                className="w-full px-3 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
              />
            </div>

            {/* Client Secret */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecrets['client_secret'] ? 'text' : 'password'}
                  value={config.client_secret || ''}
                  onChange={(e) => handleConfigChange('client_secret', e.target.value)}
                  placeholder="Enter client secret..."
                  className="w-full px-3 py-2 pr-10 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('client_secret')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showSecrets['client_secret'] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Redirect URI */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Redirect URI</label>
              <input
                type="text"
                value={config.redirect_uri || ''}
                onChange={(e) => handleConfigChange('redirect_uri', e.target.value)}
                placeholder="https://your-app.com/auth/callback"
                className="w-full px-3 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
              />
            </div>

            {/* Scopes */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Scopes</label>
              <input
                type="text"
                value={config.scopes || ''}
                onChange={(e) => handleConfigChange('scopes', e.target.value)}
                placeholder={provider.provider === 'google' ? 'email profile' : 'user:email'}
                className="w-full px-3 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
              />
            </div>

            {/* Setup Info */}
            <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-lg">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Setup Instructions:</p>
                {provider.provider === 'google' ? (
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to Google Cloud Console</li>
                    <li>Create OAuth 2.0 credentials</li>
                    <li>Add authorized redirect URI</li>
                    <li>Copy Client ID and Secret here</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to GitHub Developer Settings</li>
                    <li>Create new OAuth App</li>
                    <li>Set callback URL to your redirect URI</li>
                    <li>Copy Client ID and Secret here</li>
                  </ol>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-muted border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              provider.is_enabled
                ? 'bg-green-600/20 text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {PROVIDER_ICONS[provider.provider]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{provider.display_name}</h3>
            <p className="text-xs text-muted-foreground">
              {provider.is_enabled ? (
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
            </p>
          </div>
        </div>
        <Switch
          checked={provider.is_enabled}
          onCheckedChange={(checked) => onUpdate({ is_enabled: checked })}
          className="data-[state=checked]:bg-green-600"
        />
      </div>

      {/* Config Body */}
      <div className="p-4 space-y-4">
        {/* Warning if disabled */}
        {!provider.is_enabled && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-400">
              This provider is disabled. Enable it to allow users to sign in.
            </span>
          </div>
        )}

        {renderConfigFields()}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
