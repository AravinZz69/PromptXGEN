import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Crown, Users, Check, X, Loader2, Search, ChevronDown, ChevronRight,
  Save, AlertTriangle, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  ADMIN_PERMISSIONS, ALL_PERMISSION_KEYS, PermissionKey,
  getAdminPermissions, updateAdminPermissions,
} from '@/lib/permissionsService';
import { getAdminUsers, addAdmin, removeAdmin, updateAdminRole } from '@/lib/adminService';
import type { AdminUser } from '@/lib/adminService';

export default function RoleManagement() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [showPermDialog, setShowPermDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Group permissions by category
  const permissionsByGroup = Object.entries(ADMIN_PERMISSIONS).reduce<Record<string, { key: PermissionKey; label: string; description: string }[]>>((acc, [key, val]) => {
    if (!acc[val.group]) acc[val.group] = [];
    acc[val.group].push({ key: key as PermissionKey, label: val.label, description: val.description });
    return acc;
  }, {});

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const data = await getAdminUsers();
    setAdmins(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleEditPermissions = async (admin: AdminUser) => {
    setSelectedAdmin(admin);
    const perms = await getAdminPermissions(admin.user_id);
    setSelectedPermissions(perms);
    // Expand all groups
    const groups: Record<string, boolean> = {};
    Object.keys(permissionsByGroup).forEach(g => groups[g] = true);
    setExpandedGroups(groups);
    setShowPermDialog(true);
  };

  const togglePermission = (key: PermissionKey) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const toggleGroup = (group: string) => {
    const groupKeys = permissionsByGroup[group].map(p => p.key);
    const allSelected = groupKeys.every(k => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !groupKeys.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...groupKeys])]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;
    setSaving(selectedAdmin.user_id);
    const result = await updateAdminPermissions(selectedAdmin.user_id, selectedPermissions);
    if (result.success) {
      toast({ title: '✅ Permissions updated', description: `Updated permissions for ${selectedAdmin.full_name || selectedAdmin.email}` });
      setShowPermDialog(false);
    } else {
      toast({ title: '❌ Error', description: result.error, variant: 'destructive' });
    }
    setSaving(null);
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (!confirm(`Remove ${admin.full_name || admin.email} as admin?`)) return;
    const result = await removeAdmin(admin.id);
    if (result.success) {
      toast({ title: 'Admin removed' });
      fetchAdmins();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handlePromoteToOwner = async (admin: AdminUser) => {
    if (!confirm(`Promote ${admin.full_name || admin.email} to Super Admin? They will have full access.`)) return;
    const result = await updateAdminRole(admin.id, 'owner');
    if (result.success) {
      toast({ title: 'Promoted to Super Admin' });
      fetchAdmins();
    }
  };

  const handleDemoteToAdmin = async (admin: AdminUser) => {
    if (!confirm(`Demote ${admin.full_name || admin.email} from Super Admin to Admin?`)) return;
    const result = await updateAdminRole(admin.id, 'admin');
    if (result.success) {
      toast({ title: 'Demoted to Admin' });
      fetchAdmins();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Role & Permission Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage admin roles and configure per-admin permissions. Super Admins have full access.
        </p>
      </div>

      {/* Role Legend */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-foreground font-medium">Super Admin</span>
          <span className="text-xs text-muted-foreground">— Full access, cannot be restricted</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-medium">Admin</span>
          <span className="text-xs text-muted-foreground">— Configurable permissions</span>
        </div>
      </div>

      {/* Admin List */}
      <div className="space-y-3">
        {admins.map(admin => {
          const isSuperAdmin = admin.role === 'owner';
          return (
            <div
              key={admin.id}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={isSuperAdmin ? 'bg-amber-500/10 text-amber-400' : 'bg-primary/10 text-primary'}>
                    {(admin.full_name || admin.email || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{admin.full_name || 'Unknown'}</span>
                    <Badge className={isSuperAdmin ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/90'}>
                      {isSuperAdmin ? <Crown className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isSuperAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPermissions(admin)}
                      className="gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Permissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromoteToOwner(admin)}
                      className="gap-1 text-amber-500 hover:text-amber-400"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      Promote
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAdmin(admin)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </Button>
                  </>
                )}
                {isSuperAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoteToAdmin(admin)}
                    className="gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Demote to Admin
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {admins.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No admins configured yet.</p>
            <p className="text-sm">Add admins from the User Management page.</p>
          </div>
        )}
      </div>

      {/* Permissions Dialog */}
      <Dialog open={showPermDialog} onOpenChange={setShowPermDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Edit Permissions — {selectedAdmin?.full_name || selectedAdmin?.email}
            </DialogTitle>
            <DialogDescription>
              Toggle which sections this admin can access. Changes take effect immediately on their next page load.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPermissions([...ALL_PERMISSION_KEYS])}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPermissions([])}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Deselect All
              </Button>
              <span className="ml-auto text-sm text-muted-foreground self-center">
                {selectedPermissions.length}/{ALL_PERMISSION_KEYS.length} selected
              </span>
            </div>

            {/* Permission groups */}
            {Object.entries(permissionsByGroup).map(([group, perms]) => {
              const groupSelected = perms.filter(p => selectedPermissions.includes(p.key)).length;
              const allSelected = groupSelected === perms.length;
              const isExpanded = expandedGroups[group] !== false;

              return (
                <div key={group} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [group]: !isExpanded }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <span className="font-medium text-foreground text-sm">{group}</span>
                      <span className="text-xs text-muted-foreground">
                        {groupSelected}/{perms.length}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleGroup(group); }}
                      className="text-xs h-7"
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {perms.map(perm => (
                        <label
                          key={perm.key}
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{perm.label}</p>
                            <p className="text-xs text-muted-foreground">{perm.description}</p>
                          </div>
                          <Switch
                            checked={selectedPermissions.includes(perm.key)}
                            onCheckedChange={() => togglePermission(perm.key)}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={saving === selectedAdmin?.user_id}
              className="gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
