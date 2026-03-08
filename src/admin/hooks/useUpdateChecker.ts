import { useState, useEffect, useCallback, useRef } from 'react';
import {
  checkForUpdates,
  getAppMeta,
  getUnreadCount,
  getAllNotifications,
  markRead as markReadSvc,
  markInstalled as markInstalledSvc,
  dismiss as dismissSvc,
  saveLicenseKey as saveLicenseKeySvc,
  saveUpdatePreferences,
  type AppMeta,
  type UpdateInboxRow,
  type UpdateManifest,
} from '../services/updateService';

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function useUpdateChecker() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCritical, setIsCritical] = useState(false);
  const [notifications, setNotifications] = useState<UpdateInboxRow[]>([]);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState('Never');
  const [appMeta, setAppMeta] = useState<AppMeta | null>(null);
  const [latestManifest, setLatestManifest] = useState<UpdateManifest | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [meta, notifs, count] = await Promise.all([
        getAppMeta(),
        getAllNotifications(),
        getUnreadCount(),
      ]);
      if (meta) {
        setAppMeta(meta);
        setCurrentVersion(meta.current_version);
        setLastChecked(formatRelativeTime(meta.last_checked_at));
      }
      setNotifications(notifs);
      setUnreadCount(count);
      setIsCritical(notifs.some(n => n.is_critical && !n.is_read && !n.is_dismissed && !n.is_installed));
      setHasUpdate(notifs.some(n => !n.is_installed && !n.is_dismissed));
    } catch {
      // Silent fail
    }
  }, []);

  const checkNow = useCallback(async () => {
    setIsChecking(true);
    setServerError(null);
    try {
      const result = await checkForUpdates();
      if (result.error) {
        setServerError(result.error);
      }
      if (result.manifest) {
        setLatestManifest(result.manifest);
      }
      await loadData();
    } catch {
      setServerError('server_unreachable');
    } finally {
      setIsChecking(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
    const timer = setTimeout(() => checkNow(), 5000);
    intervalRef.current = setInterval(() => checkNow(), 6 * 60 * 60 * 1000); // 6 hours
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkNow, loadData]);

  const markRead = useCallback(async (id: string) => {
    await markReadSvc(id);
    await loadData();
  }, [loadData]);

  const markInstalledFn = useCallback(async (id: string, version: string) => {
    await markInstalledSvc(id, version);
    await loadData();
  }, [loadData]);

  const dismissFn = useCallback(async (id: string) => {
    await dismissSvc(id);
    await loadData();
  }, [loadData]);

  const saveLicenseKey = useCallback(async (key: string) => {
    await saveLicenseKeySvc(key);
    await loadData();
  }, [loadData]);

  const refetch = loadData;

  return {
    hasUpdate,
    unreadCount,
    isCritical,
    notifications,
    currentVersion,
    isChecking,
    lastChecked,
    appMeta,
    latestManifest,
    serverError,
    checkNow,
    markRead,
    markInstalled: markInstalledFn,
    dismiss: dismissFn,
    saveLicenseKey,
    saveUpdatePreferences,
    refetch,
  };
}
