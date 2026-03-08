import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  getUserProfile, updateUserProfile, createUserProfile, getUserCredits,
  type UserProfile as UserProfileType 
} from '@/lib/profileService';
import { getPaymentHistory, getUserSubscription, cancelSubscription, PLANS } from '@/lib/paymentService';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Pencil, Check, X, User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Camera, Loader2, Calendar, CreditCard, Sparkles, Shield, Zap, Crown,
  Receipt, ArrowUpRight, AlertTriangle, RefreshCw,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProfileData {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  role: string;
  useCase: string;
  experienceLevel: string;
  avatarUrl: string;
}

const roleOptions = [
  'Student', 'Developer', 'Designer', 'Product Manager', 'Content Creator',
  'Researcher', 'Business Professional', 'Freelancer', 'Other',
];

const experienceLevelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const useCaseOptions = [
  'Content Writing', 'Code Generation', 'Marketing', 'Education',
  'Research', 'Creative Writing', 'Business', 'Personal Projects', 'Other',
];

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [credits, setCredits] = useState<{ balance: number; plan: string } | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: '', email: '', mobile: '', city: '',
    role: 'Student', useCase: '', experienceLevel: 'beginner', avatarUrl: '',
  });
  const [tempProfile, setTempProfile] = useState<ProfileData>(profile);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const dbProfile = await getUserProfile(user.id);
      if (dbProfile) {
        const profileData: ProfileData = {
          fullName: dbProfile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: dbProfile.email || user.email || '',
          mobile: dbProfile.mobile || '',
          city: dbProfile.city || '',
          role: dbProfile.role || 'Student',
          useCase: dbProfile.use_case || '',
          experienceLevel: dbProfile.experience_level || 'beginner',
          avatarUrl: dbProfile.avatar_url || user.user_metadata?.avatar_url || '',
        };
        setProfile(profileData);
        setTempProfile(profileData);
      } else {
        const metadata = user.user_metadata || {};
        const defaultProfile: ProfileData = {
          fullName: metadata.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          mobile: metadata.mobile || '',
          city: metadata.city || '',
          role: metadata.role || 'Student',
          useCase: metadata.use_case || '',
          experienceLevel: metadata.experience_level || 'beginner',
          avatarUrl: metadata.avatar_url || '',
        };
        setProfile(defaultProfile);
        setTempProfile(defaultProfile);
        await createUserProfile(user.id, {
          user_id: user.id, full_name: defaultProfile.fullName, email: defaultProfile.email,
          mobile: defaultProfile.mobile, city: defaultProfile.city, role: defaultProfile.role,
          use_case: defaultProfile.useCase, experience_level: defaultProfile.experienceLevel,
          avatar_url: defaultProfile.avatarUrl,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      toast({ title: 'Error', description: 'Failed to load profile data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const loadUserCredits = useCallback(async () => {
    if (!user) return;
    const creditsData = await getUserCredits(user.id);
    if (creditsData) setCredits({ balance: creditsData.credits_balance, plan: creditsData.plan_type });
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserCredits();
      getPaymentHistory(user.id).then(setPaymentHistory);
      getUserSubscription(user.id).then(setSubscription);
    }
  }, [user, loadUserProfile, loadUserCredits]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    setIsCancelling(true);
    try {
      const result = await cancelSubscription(user.id);
      if (result.success) {
        toast({ title: 'Subscription Cancelled', description: 'You have been downgraded to the Free plan. Your remaining credits are still available.' });
        await loadUserCredits();
        const sub = await getUserSubscription(user.id);
        setSubscription(sub);
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to cancel', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const result = await updateUserProfile(user.id, {
        full_name: tempProfile.fullName, email: tempProfile.email, mobile: tempProfile.mobile,
        city: tempProfile.city, role: tempProfile.role, use_case: tempProfile.useCase,
        experience_level: tempProfile.experienceLevel, avatar_url: tempProfile.avatarUrl,
      });
      if (result.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
      } else throw new Error(result.error);
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message || 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => { setTempProfile(profile); setIsEditing(false); };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid File', description: 'Please select an image', variant: 'destructive' }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'File Too Large', description: 'Max 5MB', variant: 'destructive' }); return; }
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setTempProfile({ ...tempProfile, avatarUrl: publicUrl });
      if (!isEditing) {
        await updateUserProfile(user.id, { avatar_url: publicUrl });
        setProfile({ ...profile, avatarUrl: publicUrl });
      }
      toast({ title: 'Avatar Updated', description: 'Profile picture uploaded.' });
    } catch (err: unknown) {
      toast({ title: 'Upload Failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const userName = profile.fullName || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const planName = credits?.plan || 'free';
  const isPro = planName === 'pro' || planName === 'enterprise';

  const currentData = isEditing ? tempProfile : profile;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userName={userName}
        userRole={`${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`}
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === 'dashboard') navigate('/dashboard');
          else if (id === 'generate') navigate('/generate');
          else if (id === 'generative-ai') navigate('/generative-ai');
          else if (id === 'templates') navigate('/templates');
          else if (id === 'bookmarks') navigate('/templates?bookmarks=true');
          else if (id === 'history') navigate('/history');
          else if (id === 'analytics') navigate('/analytics');
          else if (id === 'settings') navigate('/settings');
          else if (id === 'upgrade') navigate('/upgrade');
        }}
        onLogout={() => { signOut(); navigate('/'); }}
      />

      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <main className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground mt-1">View and manage your personal information</p>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero Profile Card */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                  {/* Gradient banner */}
                  <div className="h-28 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/10 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(var(--accent)/0.1),transparent_50%)]" />
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-12">
                      {/* Avatar */}
                      <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                          <AvatarImage src={currentData.avatarUrl} alt={currentData.fullName} />
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-accent/10 text-primary font-bold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                          ) : (
                            <Camera className="h-5 w-5 text-foreground" />
                          )}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </div>

                      {/* Name & meta */}
                      <div className="flex-1 pt-2">
                        <h2 className="text-2xl font-bold text-foreground">{profile.fullName || 'Set your name'}</h2>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                            <Briefcase className="h-3.5 w-3.5" />
                            {profile.role}
                          </span>
                          {profile.city && (
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              {profile.city}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {profile.email}
                          </span>
                        </div>
                      </div>

                      {/* Credits card */}
                      {credits && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                          <div className="p-2.5 rounded-xl bg-primary/10">
                            <Zap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground leading-tight">{credits.balance}</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Credits · {credits.plan}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Personal Info */}
                  <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <ProfileField
                        icon={<User className="h-4 w-4" />}
                        label="Full Name"
                        value={currentData.fullName}
                        isEditing={isEditing}
                        onChange={(v) => setTempProfile({ ...tempProfile, fullName: v })}
                        placeholder="Enter your full name"
                      />
                      <ProfileField
                        icon={<Mail className="h-4 w-4" />}
                        label="Email Address"
                        value={currentData.email}
                        isEditing={false}
                        hint="Email cannot be changed"
                      />
                      <ProfileField
                        icon={<Phone className="h-4 w-4" />}
                        label="Mobile Number"
                        value={currentData.mobile}
                        isEditing={isEditing}
                        onChange={(v) => setTempProfile({ ...tempProfile, mobile: v })}
                        placeholder="Enter mobile number"
                        type="tel"
                      />
                      <ProfileField
                        icon={<MapPin className="h-4 w-4" />}
                        label="City"
                        value={currentData.city}
                        isEditing={isEditing}
                        onChange={(v) => setTempProfile({ ...tempProfile, city: v })}
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>

                  {/* Sidebar info */}
                  <div className="space-y-6">
                    {/* Role & Experience */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Professional
                      </h3>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs flex items-center gap-1.5 uppercase tracking-wide font-medium">
                            <Briefcase className="h-3 w-3" /> Role
                          </Label>
                          {isEditing ? (
                            <Select value={tempProfile.role} onValueChange={(v) => setTempProfile({ ...tempProfile, role: v })}>
                              <SelectTrigger className="bg-background"><SelectValue placeholder="Select role" /></SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-foreground font-medium text-sm">{profile.role || 'Not set'}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs flex items-center gap-1.5 uppercase tracking-wide font-medium">
                            <GraduationCap className="h-3 w-3" /> Experience
                          </Label>
                          {isEditing ? (
                            <Select value={tempProfile.experienceLevel} onValueChange={(v) => setTempProfile({ ...tempProfile, experienceLevel: v })}>
                              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {experienceLevelOptions.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-foreground font-medium text-sm capitalize">
                              {experienceLevelOptions.find(l => l.value === profile.experienceLevel)?.label || 'Not set'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs flex items-center gap-1.5 uppercase tracking-wide font-medium">
                            <Sparkles className="h-3 w-3" /> Use Case
                          </Label>
                          {isEditing ? (
                            <Select value={tempProfile.useCase} onValueChange={(v) => setTempProfile({ ...tempProfile, useCase: v })}>
                              <SelectTrigger className="bg-background"><SelectValue placeholder="Select use case" /></SelectTrigger>
                              <SelectContent>
                                {useCaseOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-foreground font-medium text-sm">{profile.useCase || 'Not set'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subscription Management */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        Subscription
                      </h3>
                      <div className="space-y-4">
                        {/* Current Plan */}
                        <div className="p-3 rounded-xl border border-border bg-background">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Current Plan</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isPro ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {isPro ? 'Active' : 'Free Tier'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Crown className={`h-5 w-5 ${isPro ? 'text-amber-400' : 'text-muted-foreground'}`} />
                            <span className="text-lg font-bold text-foreground capitalize">{planName}</span>
                          </div>
                        </div>

                        {/* Credits Overview */}
                        <div className="p-3 rounded-xl border border-border bg-background">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Credits</span>
                            <span className="text-xs text-muted-foreground">
                              {credits?.balance === -1 ? '∞' : credits?.balance || 0} remaining
                            </span>
                          </div>
                          {credits && credits.balance !== -1 && (
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((credits.balance) / (subscription?.totalCredits || 20)) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Last Payment */}
                        {subscription?.lastPayment && (
                          <div className="p-3 rounded-xl border border-border bg-background">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Last Payment</span>
                            <p className="text-sm text-foreground font-medium mt-1">
                              ₹{subscription.lastPayment.amount} · {subscription.lastPayment.plan_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(subscription.lastPayment.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Member Since</p>
                          <p className="text-sm text-foreground font-medium">{formatDate(user?.created_at)}</p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-1">
                          {isPro ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/upgrade')}
                                className="w-full gap-2 hover:border-primary/30"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Change Plan
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCancelDialog(true)}
                                className="w-full gap-2 text-destructive hover:text-destructive hover:border-destructive/30"
                              >
                                <X className="h-3.5 w-3.5" />
                                Cancel Subscription
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/upgrade')}
                              className="w-full gap-2 hover:border-primary/30"
                            >
                              <Crown className="h-3.5 w-3.5" />
                              Upgrade to Pro
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                {paymentHistory.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      Payment History
                    </h3>
                    <div className="space-y-3">
                      {paymentHistory.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-background"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              tx.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                              <CreditCard className={`h-4 w-4 ${
                                tx.status === 'success' ? 'text-green-500' : 'text-red-500'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {tx.plan_name} Plan
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })} · {tx.gateway?.charAt(0).toUpperCase() + tx.gateway?.slice(1)}
                                {tx.metadata?.is_test_mode && ' · 🧪 Test'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              ₹{tx.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              +{tx.credits_purchased === 9999 ? '∞' : tx.credits_purchased} credits
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {paymentHistory.length >= 10 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/transactions')}
                        className="w-full mt-3 gap-2"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        View All Transactions
                      </Button>
                    )}
                    {paymentHistory.length > 0 && paymentHistory.length < 10 && (
                      <div className="text-center mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/transactions')}
                          className="gap-2 text-muted-foreground"
                        >
                          View Full History
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to cancel your <strong className="text-foreground capitalize">{planName}</strong> plan?</p>
              <ul className="text-sm space-y-1 mt-2">
                <li>• You'll be downgraded to the Free plan immediately</li>
                <li>• Your remaining credits ({credits?.balance || 0}) will be preserved</li>
                <li>• You can re-subscribe anytime from the Pricing page</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Plan</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Reusable field component
function ProfileField({ icon, label, value, isEditing, onChange, placeholder, type, hint }: {
  icon: React.ReactNode; label: string; value: string; isEditing: boolean;
  onChange?: (v: string) => void; placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-xs flex items-center gap-1.5 uppercase tracking-wide font-medium">
        {icon} {label}
      </Label>
      {isEditing && onChange ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          className="bg-background"
        />
      ) : (
        <>
          <p className="text-foreground font-medium text-sm">{value || 'Not set'}</p>
          {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
        </>
      )}
    </div>
  );
}

export default UserProfile;
