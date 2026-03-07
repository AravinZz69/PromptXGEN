import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile,
  getUserCredits,
  type UserProfile as UserProfileType 
} from '@/lib/profileService';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Pencil,
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Camera,
  Loader2,
  Calendar,
  CreditCard,
  Sparkles,
} from 'lucide-react';

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
  'Student',
  'Developer',
  'Designer',
  'Product Manager',
  'Content Creator',
  'Researcher',
  'Business Professional',
  'Freelancer',
  'Other',
];

const experienceLevelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const useCaseOptions = [
  'Content Writing',
  'Code Generation',
  'Marketing',
  'Education',
  'Research',
  'Creative Writing',
  'Business',
  'Personal Projects',
  'Other',
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

  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    mobile: '',
    city: '',
    role: 'Student',
    useCase: '',
    experienceLevel: 'beginner',
    avatarUrl: '',
  });

  const [tempProfile, setTempProfile] = useState<ProfileData>(profile);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
        // Create profile from auth metadata if doesn't exist in DB
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
        
        // Save to database
        await createUserProfile(user.id, {
          user_id: user.id,
          full_name: defaultProfile.fullName,
          email: defaultProfile.email,
          mobile: defaultProfile.mobile,
          city: defaultProfile.city,
          role: defaultProfile.role,
          use_case: defaultProfile.useCase,
          experience_level: defaultProfile.experienceLevel,
          avatar_url: defaultProfile.avatarUrl,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const loadUserCredits = useCallback(async () => {
    if (!user) return;
    
    const creditsData = await getUserCredits(user.id);
    if (creditsData) {
      setCredits({
        balance: creditsData.credits_balance,
        plan: creditsData.plan_type,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserCredits();
    }
  }, [user, loadUserProfile, loadUserCredits]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const result = await updateUserProfile(user.id, {
        full_name: tempProfile.fullName,
        email: tempProfile.email,
        mobile: tempProfile.mobile,
        city: tempProfile.city,
        role: tempProfile.role,
        use_case: tempProfile.useCase,
        experience_level: tempProfile.experienceLevel,
        avatar_url: tempProfile.avatarUrl,
      });

      if (result.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been saved successfully.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, GIF)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setTempProfile({ ...tempProfile, avatarUrl: publicUrl });
      
      // Also update immediately if not in edit mode
      if (!isEditing) {
        await updateUserProfile(user.id, { avatar_url: publicUrl });
        setProfile({ ...profile, avatarUrl: publicUrl });
      }

      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been uploaded successfully.',
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const userName = profile.fullName || user?.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole={credits?.plan || 'Free Plan'}
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
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content */}
      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <main className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground mt-1">View and manage your personal information</p>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Profile Card */}
                <motion.div
                  className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={tempProfile.avatarUrl} alt={tempProfile.fullName} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground">{profile.fullName}</h2>
                      <p className="text-primary font-medium">{profile.role}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground text-sm">
                        {profile.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </span>
                      </div>
                    </div>

                    {/* Credits Badge */}
                    {credits && (
                      <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                        <div className="flex items-center gap-2 text-accent-foreground mb-1">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase">Credits</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{credits.balance}</p>
                        <p className="text-xs text-muted-foreground capitalize">{credits.plan} Plan</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div
                  className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={tempProfile.fullName}
                          onChange={(e) => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-foreground font-medium">{profile.fullName || 'Not set'}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <p className="text-foreground font-medium">{profile.email}</p>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    {/* Mobile */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Mobile Number
                      </Label>
                      {isEditing ? (
                        <Input
                          value={tempProfile.mobile}
                          onChange={(e) => setTempProfile({ ...tempProfile, mobile: e.target.value })}
                          placeholder="Enter your mobile number"
                          type="tel"
                        />
                      ) : (
                        <p className="text-foreground font-medium">{profile.mobile || 'Not set'}</p>
                      )}
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        City
                      </Label>
                      {isEditing ? (
                        <Input
                          value={tempProfile.city}
                          onChange={(e) => setTempProfile({ ...tempProfile, city: e.target.value })}
                          placeholder="Enter your city"
                        />
                      ) : (
                        <p className="text-foreground font-medium">{profile.city || 'Not set'}</p>
                      )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Role / Profession
                      </Label>
                      {isEditing ? (
                        <Select
                          value={tempProfile.role}
                          onValueChange={(value) => setTempProfile({ ...tempProfile, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-foreground font-medium">{profile.role || 'Not set'}</p>
                      )}
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Experience Level
                      </Label>
                      {isEditing ? (
                        <Select
                          value={tempProfile.experienceLevel}
                          onValueChange={(value) => setTempProfile({ ...tempProfile, experienceLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevelOptions.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-foreground font-medium capitalize">
                          {experienceLevelOptions.find(l => l.value === profile.experienceLevel)?.label || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Use Case */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Primary Use Case
                      </Label>
                      {isEditing ? (
                        <Select
                          value={tempProfile.useCase}
                          onValueChange={(value) => setTempProfile({ ...tempProfile, useCase: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your primary use case" />
                          </SelectTrigger>
                          <SelectContent>
                            {useCaseOptions.map((useCase) => (
                              <SelectItem key={useCase} value={useCase}>
                                {useCase}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-foreground font-medium">{profile.useCase || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Account Information */}
                <motion.div
                  className="bg-card border border-border rounded-2xl p-6 shadow-lg mt-6"
                  whileHover={{ y: -2 }}
                >
                  <h3 className="text-xl font-semibold text-foreground mb-6">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Account Created
                      </Label>
                      <p className="text-foreground font-medium">
                        {formatDate(user?.created_at)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Current Plan
                      </Label>
                      <p className="text-foreground font-medium capitalize">
                        {credits?.plan || 'Free'} Plan
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
