import { supabase } from '@/lib/supabase';

const UPDATE_SERVER_URL = "https://updates.askjai.com";

// ── Semver comparison ────────────────────────────────────

export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

// ── Types ────────────────────────────────────────────────

export interface UpdateManifest {
  product: string;
  latest_version: string;
  minimum_supported_version: string;
  released_at: string;
  is_critical: boolean;
  title: string;
  type: string;
  changelog: string[];
  download_url: string;
  changelog_url: string;
  size_mb: number;
  min_app_version: string;
  version_history: {
    version: string;
    released_at: string;
    type: string;
    title: string;
  }[];
}

export interface AppMeta {
  id: string;
  current_version: string;
  product_name: string;
  license_key: string | null;
  owner_email: string | null;
  installed_at: string;
  last_checked_at: string | null;
  last_updated_at: string | null;
  update_channel: string;
  auto_check_enabled: boolean;
}

export interface UpdateInboxRow {
  id: string;
  version: string;
  title: string | null;
  type: string;
  changelog: string[];
  download_url: string | null;
  changelog_url: string | null;
  size_mb: number | null;
  is_critical: boolean;
  released_at: string | null;
  min_app_version: string | null;
  is_read: boolean;
  is_installed: boolean;
  is_dismissed: boolean;
  received_at: string;
  installed_at: string | null;
}

// ── Check for updates ────────────────────────────────────

export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  manifest?: UpdateManifest;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${UPDATE_SERVER_URL}/manifest.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { hasUpdate: false, error: 'server_unreachable' };
    }

    const manifest: UpdateManifest = await response.json();

    // Get current version from app_meta
    const { data: meta } = await supabase
      .from('app_meta')
      .select('*')
      .limit(1)
      .single();

    const currentVersion = meta?.current_version || '1.0.0';

    // Update last_checked_at
    if (meta?.id) {
      await supabase
        .from('app_meta')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', meta.id);
    }

    // Compare versions
    if (compareVersions(manifest.latest_version, currentVersion) > 0) {
      // Check if already in inbox
      const { data: existing } = await supabase
        .from('update_inbox')
        .select('id')
        .eq('version', manifest.latest_version)
        .maybeSingle();

      if (!existing) {
        await supabase.from('update_inbox').insert({
          version: manifest.latest_version,
          title: manifest.title,
          type: manifest.type,
          changelog: manifest.changelog,
          download_url: manifest.download_url,
          changelog_url: manifest.changelog_url,
          size_mb: manifest.size_mb,
          is_critical: manifest.is_critical,
          released_at: manifest.released_at,
          min_app_version: manifest.min_app_version,
        });
      }

      return { hasUpdate: true, manifest };
    }

    return { hasUpdate: false };
  } catch {
    return { hasUpdate: false, error: 'server_unreachable' };
  }
}

// ── Data access ──────────────────────────────────────────

export async function getAppMeta(): Promise<AppMeta | null> {
  const { data } = await supabase
    .from('app_meta')
    .select('*')
    .limit(1)
    .single();
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { count } = await supabase
    .from('update_inbox')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .eq('is_dismissed', false)
    .eq('is_installed', false);
  return count || 0;
}

export async function getAllNotifications(): Promise<UpdateInboxRow[]> {
  const { data } = await supabase
    .from('update_inbox')
    .select('*')
    .order('received_at', { ascending: false });
  return (data as UpdateInboxRow[]) || [];
}

export async function markRead(id: string): Promise<void> {
  await supabase
    .from('update_inbox')
    .update({ is_read: true })
    .eq('id', id);
}

export async function markInstalled(id: string, version: string): Promise<void> {
  await supabase
    .from('update_inbox')
    .update({ is_installed: true, installed_at: new Date().toISOString() })
    .eq('id', id);

  await supabase
    .from('app_meta')
    .update({
      current_version: version,
      last_updated_at: new Date().toISOString(),
    })
    .limit(1);
}

export async function dismiss(id: string): Promise<void> {
  await supabase
    .from('update_inbox')
    .update({ is_dismissed: true })
    .eq('id', id);
}

export async function saveLicenseKey(key: string): Promise<void> {
  await supabase
    .from('app_meta')
    .update({ license_key: key })
    .limit(1);
}

export async function saveUpdatePreferences(prefs: {
  auto_check_enabled?: boolean;
  update_channel?: string;
}): Promise<void> {
  await supabase
    .from('app_meta')
    .update(prefs)
    .limit(1);
}
