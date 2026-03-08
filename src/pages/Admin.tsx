'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  Crown,
  Zap,
  TrendingUp,
  Activity,
  UserPlus,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  Check,
  Coins,
  RefreshCw,
  Plus,
  Infinity,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import useAdmin from '@/hooks/useAdmin';
import { UserRole, UserWithProfile, AdminUser } from '@/lib/adminService';
import { CountUp } from '@/components/ui/CountUp';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { cn } from '@/lib/utils';

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'primary',
}: {
  title: string;
  value: number;
  icon: any;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'success';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-purple-500/10 text-purple-500',
    warning: 'bg-amber-500/10 text-amber-500',
    success: 'bg-emerald-500/10 text-emerald-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">
                <CountUp value={value} duration={1.5} />
              </p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
              {trend && (
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-sm',
                  trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                )}>
                  <TrendingUp className={cn('w-4 h-4', !trend.isPositive && 'rotate-180')} />
                  <span>{trend.value}%</span>
                </div>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', colorClasses[color])}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Activity Chart Component (simplified bar representation)
function ActivityChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const last7Days = data.slice(-7);

  return (
    <div className="flex items-end gap-2 h-32">
      {last7Days.map((item, index) => (
        <motion.div
          key={item.date}
          className="flex-1 flex flex-col items-center gap-2"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ delay: index * 0.1 }}
        >
          <div
            className="w-full bg-primary rounded-t transition-all"
            style={{
              height: `${(item.count / maxCount) * 100}%`,
              minHeight: item.count > 0 ? '8px' : '2px',
            }}
          />
          <span className="text-xs text-muted-foreground">
            {new Date(item.date).toLocaleDateString('en', { weekday: 'short' })}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// User Management Table
function UserTable({
  users,
  isOwner,
  onEdit,
  onToggleActive,
  onUpdateCredits,
  onAddCredits,
  onSetUnlimited,
  onResetCredits,
  onMakeAdmin,
}: {
  users: UserWithProfile[];
  isOwner: boolean;
  onEdit: (user: UserWithProfile) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
  onUpdateCredits: (user: UserWithProfile) => void;
  onAddCredits: (user: UserWithProfile) => void;
  onSetUnlimited: (user: UserWithProfile) => void;
  onResetCredits: (userId: string) => void;
  onMakeAdmin: (user: UserWithProfile) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {user.profile?.full_name || 'Unknown'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.admin?.role === 'owner'
                      ? 'default'
                      : user.admin?.role === 'admin'
                      ? 'secondary'
                      : 'outline'
                  }
                  className={cn(
                    user.admin?.role === 'owner' && 'bg-amber-500 hover:bg-amber-600',
                    user.admin?.role === 'admin' && 'bg-purple-500 hover:bg-purple-600'
                  )}
                >
                  {user.admin?.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                  {user.admin?.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {user.admin?.role || 'user'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>{user.credits || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.profile?.is_active ? 'default' : 'destructive'}>
                  {user.profile?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Credit Management</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onAddCredits(user)}>
                      <Plus className="w-4 h-4 mr-2 text-green-500" />
                      Add Credits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateCredits(user)}>
                      <Coins className="w-4 h-4 mr-2" />
                      Set Credits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSetUnlimited(user)}>
                      <Infinity className="w-4 h-4 mr-2 text-purple-500" />
                      Set Unlimited
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResetCredits(user.id)}>
                      <RotateCcw className="w-4 h-4 mr-2 text-blue-500" />
                      Reset Used Credits
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    {isOwner && !user.admin && (
                      <DropdownMenuItem onClick={() => onMakeAdmin(user)}>
                        <Shield className="w-4 h-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onToggleActive(user.id, !user.profile?.is_active)}
                      className={user.profile?.is_active ? 'text-red-500' : 'text-green-500'}
                    >
                      {user.profile?.is_active ? (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Admin Management Table
function AdminTable({
  admins,
  isOwner,
  currentUserId,
  onUpdateRole,
  onRemove,
}: {
  admins: AdminUser[];
  isOwner: boolean;
  currentUserId: string;
  onUpdateRole: (admin: AdminUser) => void;
  onRemove: (admin: AdminUser) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admin</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {admin.full_name?.charAt(0) || admin.email?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{admin.full_name || 'Unknown'}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    admin.role === 'owner' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-500 hover:bg-purple-600'
                  )}
                >
                  {admin.role === 'owner' ? (
                    <Crown className="w-3 h-3 mr-1" />
                  ) : (
                    <Shield className="w-3 h-3 mr-1" />
                  )}
                  {admin.role}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(admin.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {isOwner && admin.user_id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUpdateRole(admin)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRemove(admin)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Main Admin Page Component
export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isAdmin,
    isOwner,
    loading,
    stats,
    users,
    admins,
    activity,
    loadDashboardData,
    refreshUsers,
    addAdmin: addAdminAction,
    updateAdminRole: updateAdminRoleAction,
    removeAdmin: removeAdminAction,
    toggleUserActive,
    updateCredits,
    addCredits,
    setUnlimitedCredits,
    resetCredits,
    searchUsers,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [dialogType, setDialogType] = useState<'credits' | 'addCredits' | 'unlimited' | 'role' | 'makeAdmin' | 'removeAdmin' | null>(null);
  const [creditsValue, setCreditsValue] = useState('');
  const [addCreditsValue, setAddCreditsValue] = useState('');
  const [roleValue, setRoleValue] = useState<UserRole>('admin');

  // Redirect non-admins
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
        variant: 'destructive',
      });
    }
  }, [loading, isAdmin, navigate, toast]);

  // Load data on mount
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, loadDashboardData]);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  // Handle credits update (set total)
  const handleCreditsUpdate = async () => {
    if (!selectedUser) return;
    const credits = parseInt(creditsValue);
    if (isNaN(credits) || credits < 0) {
      toast({ title: 'Invalid credits value', variant: 'destructive' });
      return;
    }

    const result = await updateCredits(selectedUser.id, credits);
    if (result.success) {
      toast({ title: 'Credits updated successfully' });
      setDialogType(null);
      setSelectedUser(null);
      setCreditsValue('');
    } else {
      toast({ title: 'Failed to update credits', description: result.error, variant: 'destructive' });
    }
  };

  // Handle add credits
  const handleAddCredits = async () => {
    if (!selectedUser) return;
    const credits = parseInt(addCreditsValue);
    if (isNaN(credits) || credits <= 0) {
      toast({ title: 'Please enter a valid positive number', variant: 'destructive' });
      return;
    }

    const result = await addCredits(selectedUser.id, credits);
    if (result.success) {
      toast({ title: `Added ${credits} credits successfully` });
      setDialogType(null);
      setSelectedUser(null);
      setAddCreditsValue('');
    } else {
      toast({ title: 'Failed to add credits', description: result.error, variant: 'destructive' });
    }
  };

  // Handle set unlimited credits
  const handleSetUnlimited = async () => {
    if (!selectedUser) return;

    const result = await setUnlimitedCredits(selectedUser.id);
    if (result.success) {
      toast({ title: 'User now has unlimited credits' });
      setDialogType(null);
      setSelectedUser(null);
    } else {
      toast({ title: 'Failed to set unlimited credits', description: result.error, variant: 'destructive' });
    }
  };

  // Handle reset credits
  const handleResetCredits = async (userId: string) => {
    const result = await resetCredits(userId);
    if (result.success) {
      toast({ title: 'Credits reset successfully' });
    } else {
      toast({ title: 'Failed to reset credits', description: result.error, variant: 'destructive' });
    }
  };

  // Handle make admin
  const handleMakeAdmin = async () => {
    if (!selectedUser) return;

    const result = await addAdminAction(selectedUser.id, roleValue);
    if (result.success) {
      toast({ title: 'Admin added successfully' });
      setDialogType(null);
      setSelectedUser(null);
      setRoleValue('admin');
    } else {
      toast({ title: 'Failed to add admin', description: result.error, variant: 'destructive' });
    }
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!selectedAdmin) return;

    const result = await updateAdminRoleAction(selectedAdmin.id, roleValue);
    if (result.success) {
      toast({ title: 'Role updated successfully' });
      setDialogType(null);
      setSelectedAdmin(null);
      setRoleValue('admin');
    } else {
      toast({ title: 'Failed to update role', description: result.error, variant: 'destructive' });
    }
  };

  // Handle remove admin
  const handleRemoveAdmin = async () => {
    if (!selectedAdmin) return;

    const result = await removeAdminAction(selectedAdmin.id);
    if (result.success) {
      toast({ title: 'Admin removed successfully' });
      setDialogType(null);
      setSelectedAdmin(null);
    } else {
      toast({ title: 'Failed to remove admin', description: result.error, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader variant="text" lines={1} width="200px" className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage users, admins, and system settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={isOwner ? 'bg-amber-500/10 text-amber-500 border-amber-500/50' : ''}>
                {isOwner ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </>
                )}
              </Badge>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon={Users}
            description="All registered users"
            color="primary"
          />
          <StatsCard
            title="Active Users"
            value={stats?.active_users || 0}
            icon={Activity}
            description="Currently active"
            color="success"
          />
          <StatsCard
            title="Admins"
            value={stats?.total_admins || 0}
            icon={Shield}
            description={`${stats?.total_owners || 0} owners`}
            color="accent"
          />
          <StatsCard
            title="Total Prompts"
            value={stats?.total_prompts || 0}
            icon={Zap}
            description="Generated prompts"
            color="warning"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Users Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                <CountUp value={stats?.new_users_today || 0} />
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Users This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                <CountUp value={stats?.new_users_week || 0} />
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                <CountUp value={stats?.total_credits_used || 0} />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        {activity.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                User Activity (Last 7 Days)
              </CardTitle>
              <CardDescription>Prompts generated per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart data={activity} />
            </CardContent>
          </Card>
        )}

        {/* Tabs for Users and Admins */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="w-4 h-4" />
              Admins ({admins.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {users.length > 0 ? (
              <UserTable
                users={users}
                isOwner={isOwner}
                onEdit={(user) => {
                  // Open edit dialog
                }}
                onToggleActive={async (userId, isActive) => {
                  const result = await toggleUserActive(userId, isActive);
                  if (result.success) {
                    toast({ title: `User ${isActive ? 'activated' : 'deactivated'}` });
                  }
                }}
                onUpdateCredits={(user) => {
                  setSelectedUser(user);
                  setCreditsValue(String(user.credits || 0));
                  setDialogType('credits');
                }}
                onAddCredits={(user) => {
                  setSelectedUser(user);
                  setCreditsValue('100'); // Default amount to add
                  setDialogType('addCredits');
                }}
                onSetUnlimited={(user) => {
                  setSelectedUser(user);
                  setDialogType('unlimited');
                }}
                onResetCredits={async (userId) => {
                  const result = await resetCredits(userId);
                  if (result.success) {
                    toast({ title: 'Credits reset', description: 'Used credits have been reset to 0' });
                  } else {
                    toast({ title: 'Error', description: result.error, variant: 'destructive' });
                  }
                }}
                onMakeAdmin={(user) => {
                  setSelectedUser(user);
                  setRoleValue('admin');
                  setDialogType('makeAdmin');
                }}
              />
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No users found
              </Card>
            )}
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            {admins.length > 0 ? (
              <AdminTable
                admins={admins}
                isOwner={isOwner}
                currentUserId="" // You'd get this from auth context
                onUpdateRole={(admin) => {
                  setSelectedAdmin(admin);
                  setRoleValue(admin.role);
                  setDialogType('role');
                }}
                onRemove={(admin) => {
                  setSelectedAdmin(admin);
                  setDialogType('removeAdmin');
                }}
              />
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No admins found
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Credits Dialog */}
      <Dialog open={dialogType === 'credits'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Credits</DialogTitle>
            <DialogDescription>
              Set total credits for {selectedUser?.profile?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Enter credits amount"
              value={creditsValue}
              onChange={(e) => setCreditsValue(e.target.value)}
              min={0}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreditsUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={dialogType === 'addCredits'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Add credits to {selectedUser?.profile?.full_name || selectedUser?.email}'s current balance.
              Current credits: {selectedUser?.credits ?? 0}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Credits to add"
              value={creditsValue}
              onChange={(e) => setCreditsValue(e.target.value)}
              min={1}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddCredits} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Unlimited Credits Dialog */}
      <Dialog open={dialogType === 'unlimited'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Unlimited Credits</DialogTitle>
            <DialogDescription>
              Grant unlimited credits to {selectedUser?.profile?.full_name || selectedUser?.email}.
              This will set their total credits to -1 (unlimited).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center justify-center gap-2 text-purple-500">
            <Infinity className="w-8 h-8" />
            <span className="text-lg font-semibold">Unlimited Credits</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleSetUnlimited} className="bg-purple-600 hover:bg-purple-700">
              <Infinity className="w-4 h-4 mr-2" />
              Grant Unlimited
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Make Admin Dialog */}
      <Dialog open={dialogType === 'makeAdmin'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
            <DialogDescription>
              Make {selectedUser?.profile?.full_name || selectedUser?.email} an admin
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={roleValue} onValueChange={(v) => setRoleValue(v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                  </div>
                </SelectItem>
                {isOwner && (
                  <SelectItem value="owner">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Owner
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleMakeAdmin}>Add Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={dialogType === 'role'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedAdmin?.full_name || selectedAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={roleValue} onValueChange={(v) => setRoleValue(v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="owner">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Owner
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Admin Dialog */}
      <Dialog open={dialogType === 'removeAdmin'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedAdmin?.full_name || selectedAdmin?.email} as an admin?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveAdmin}>
              Remove Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
