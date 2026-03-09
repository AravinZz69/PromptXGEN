import React, { useState } from 'react';
import {
  RefreshCw, Check, Download, ExternalLink, AlertTriangle,
  ChevronRight, Lock, Loader2, X, CheckCircle2,
} from 'lucide-react';
import { useUpdateChecker } from '../hooks/useUpdateChecker';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { UpdateInboxRow } from '../services/updateService';

const UPDATE_SERVER_URL = "https://updates.askjai.com";

const typeBadge: Record<string, string> = {
  feature: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bugfix: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  security: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusBadge = (n: UpdateInboxRow) => {
  if (n.is_installed) return { text: '✓ Installed', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
  if (n.is_dismissed) return { text: 'Dismissed', cls: 'bg-muted text-muted-foreground border-border' };
  return { text: 'Available', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
};

export default function Updates() {
  const {
    hasUpdate, notifications, currentVersion, isChecking,
    lastChecked, appMeta, latestManifest, serverError,
    checkNow, markInstalled, dismiss, saveLicenseKey, saveUpdatePreferences,
  } = useUpdateChecker();
  const { toast } = useToast();

  const [licenseInput, setLicenseInput] = useState(appMeta?.license_key || '');
  const [confirmInstall, setConfirmInstall] = useState<UpdateInboxRow | null>(null);
  const [changelogDialog, setChangelogDialog] = useState<UpdateInboxRow | null>(null);
  const [autoCheck, setAutoCheck] = useState(appMeta?.auto_check_enabled ?? true);
  const [channel, setChannel] = useState(appMeta?.update_channel || 'stable');

  React.useEffect(() => {
    if (appMeta) {
      setLicenseInput(appMeta.license_key || '');
      setAutoCheck(appMeta.auto_check_enabled);
      setChannel(appMeta.update_channel);
    }
  }, [appMeta]);

  const latestNotif = notifications.find(n => !n.is_installed && !n.is_dismissed);
  const latestVersion = latestManifest?.latest_version || latestNotif?.version;

  const handleCheck = async () => {
    await checkNow();
    toast({ title: serverError ? 'Could not reach update server' : 'Check complete', variant: serverError ? 'destructive' : 'default' });
  };

  const handleMarkInstalled = async () => {
    if (!confirmInstall) return;
    try {
      await markInstalled(confirmInstall.id, confirmInstall.version);
      toast({ title: 'Marked as installed', description: `Version ${confirmInstall.version} set as current.` });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setConfirmInstall(null);
  };

  const handleDismiss = async (id: string) => {
    await dismiss(id);
    toast({ title: 'Dismissed' });
  };

  const handleSaveLicense = async () => {
    await saveLicenseKey(licenseInput);
    toast({ title: 'License key saved' });
  };

  const handleAutoCheckToggle = async () => {
    const newVal = !autoCheck;
    setAutoCheck(newVal);
    await saveUpdatePreferences({ auto_check_enabled: newVal });
    toast({ title: newVal ? 'Auto-check enabled' : 'Auto-check disabled' });
  };

  const handleChannelChange = async (val: string) => {
    setChannel(val);
    await saveUpdatePreferences({ update_channel: val });
    toast({ title: `Update channel set to ${val}` });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Updates</h1>
          <p className="text-muted-foreground text-sm">Manage your AskJai application updates</p>
        </div>
        <button
          onClick={handleCheck}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Check Now
        </button>
      </div>

      {/* Current Version Info */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-2.5">
        <span className="text-foreground font-medium">AskJai v{currentVersion}</span>
        <span>•</span>
        <span>Last checked: {lastChecked}</span>
        <span>•</span>
        <span>License: {appMeta?.license_key || <span className="text-muted-foreground italic">Not set</span>}</span>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2.5">
          <AlertTriangle className="w-4 h-4" />
          Could not reach update server. Updates will be checked again automatically.
        </div>
      )}

      {/* Update Available */}
      {hasUpdate && latestNotif && (
        <div className={`bg-card border rounded-xl overflow-hidden ${latestNotif.is_critical ? 'border-l-4 border-l-red-500 border-red-500/30' : 'border-l-4 border-l-primary border-border'}`}>
          {latestNotif.is_critical && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 flex items-center gap-2 text-red-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              Critical Update — Install as soon as possible
            </div>
          )}
          <div className="p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Update Available</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-muted rounded-full text-xs text-muted-foreground font-mono">
                    v{currentVersion} <ChevronRight className="w-3 h-3 inline" /> v{latestVersion}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeBadge[latestNotif.type] || typeBadge.feature}`}>
                    {latestNotif.type}
                  </span>
                </div>
                {latestNotif.released_at && <p className="text-muted-foreground text-sm">Released: {latestNotif.released_at}</p>}
                {latestNotif.size_mb && <p className="text-muted-foreground text-sm">Size: {latestNotif.size_mb} MB</p>}
              </div>
              <div className="space-y-3 shrink-0">
                {latestNotif.download_url && (
                  <a
                    href={latestNotif.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Update
                  </a>
                )}
                <div className="text-xs text-muted-foreground space-y-0.5 pl-1">
                  <p className="font-medium text-foreground">After downloading:</p>
                  <p>1. Extract the ZIP file</p>
                  <p>2. Replace your project files</p>
                  <p>3. Run: <code className="text-foreground">npm install</code></p>
                  <p>4. Run: <code className="text-foreground">npm run build</code></p>
                  <p>5. Restart your server</p>
                </div>
                {latestNotif.changelog_url && (
                  <a href={latestNotif.changelog_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> View Changelog
                  </a>
                )}
              </div>
            </div>

            {latestNotif.changelog && latestNotif.changelog.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">What's new in v{latestVersion}</h3>
                  <ul className="space-y-1.5">
                    {latestNotif.changelog.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => setConfirmInstall(latestNotif)}
                className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-border rounded-lg text-sm transition-colors"
              >
                Mark as Installed
              </button>
              <button
                onClick={() => handleDismiss(latestNotif.id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Up to Date */}
      {!hasUpdate && !serverError && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">You're up to date!</h2>
          <p className="text-muted-foreground text-sm">AskJai v{currentVersion} is the latest version</p>
          <p className="text-muted-foreground text-xs">Last checked: {lastChecked}</p>
          <button onClick={handleCheck} className="text-sm text-primary hover:text-primary/80 transition-colors">
            Check Again
          </button>
        </div>
      )}

      {/* Update History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Update History</h2>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">No updates received yet</p>
            <p className="text-sm mt-1">Updates will appear here when available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-3 font-medium">Version</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Received</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => {
                  const status = statusBadge(n);
                  return (
                    <tr key={n.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 pr-3">
                        <span className="px-2 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground">v{n.version}</span>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeBadge[n.type] || typeBadge.feature}`}>
                          {n.type}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-foreground">{n.title || '-'}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{new Date(n.received_at).toLocaleDateString()}</td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.cls}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="py-3 space-x-2">
                        <button
                          onClick={() => setChangelogDialog(n)}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Changelog
                        </button>
                        {!n.is_installed && !n.is_dismissed && (
                          <button
                            onClick={() => handleDismiss(n.id)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Dismiss
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Update Settings</h2>

        {/* License */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">License Key</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              placeholder="ASKJAI-XXXX-XXXX-XXXX"
              className="flex-1 bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleSaveLicense}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Save Key
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Enter the license key provided when you purchased AskJai</p>
        </div>

        <div className="border-t border-border" />

        {/* Preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-check for updates</p>
              <p className="text-xs text-muted-foreground">Automatically check for new versions every 6 hours</p>
            </div>
            <button
              onClick={handleAutoCheckToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoCheck ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary-foreground transition-transform ${autoCheck ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {autoCheck && (
            <div className="space-y-2 pl-0">
              <label className="text-sm font-medium text-foreground">Update Channel</label>
              <select
                value={channel}
                onChange={(e) => handleChannelChange(e.target.value)}
                className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="stable">Stable (recommended)</option>
                <option value="beta">Beta</option>
                <option value="alpha">Alpha</option>
              </select>
              {channel !== 'stable' && (
                <p className="text-xs text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Beta/Alpha builds may be unstable
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              Update Server <Lock className="w-3 h-3 text-muted-foreground" />
            </label>
            <input
              type="text"
              value={UPDATE_SERVER_URL}
              readOnly
              className="bg-muted border border-border text-muted-foreground rounded-lg px-3 py-2 text-sm w-full cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Managed by AskJai</p>
          </div>
        </div>
      </div>

      {/* Confirm Install Dialog */}
      <AlertDialog open={!!confirmInstall} onOpenChange={() => setConfirmInstall(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirm Installation</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Have you already installed v{confirmInstall?.version}? This will update your current version record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-muted-foreground hover:bg-muted/80">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkInstalled} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Yes, I've installed it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Changelog Dialog */}
      <Dialog open={!!changelogDialog} onOpenChange={() => setChangelogDialog(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Changelog — v{changelogDialog?.version}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {changelogDialog?.changelog && changelogDialog.changelog.length > 0 ? (
              <ul className="space-y-1.5">
                {changelogDialog.changelog.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No changelog available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
