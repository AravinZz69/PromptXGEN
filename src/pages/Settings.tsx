import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Pencil,
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
  Loader2,
} from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  avatarUrl: string;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Initialize profile from user data
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    role: 'Student',
    avatarUrl: '',
  });

  // Temp state for editing
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Load saved profile from localStorage or use defaults
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
        setTempProfile(JSON.parse(savedProfile));
      } else {
        const defaultProfile: UserProfile = {
          firstName,
          lastName,
          email: user.email || '',
          phone: '',
          location: '',
          role: 'Student',
          avatarUrl: user.user_metadata?.avatar_url || '',
        };
        setProfile(defaultProfile);
        setTempProfile(defaultProfile);
      }
    }
  }, [user]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = () => {
    setProfile(tempProfile);
    localStorage.setItem(`profile_${user?.id}`, JSON.stringify(tempProfile));
    setIsEditingProfile(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been saved successfully.',
    });
  };

  const handleSavePersonal = () => {
    setProfile(tempProfile);
    localStorage.setItem(`profile_${user?.id}`, JSON.stringify(tempProfile));
    setIsEditingPersonal(false);
    toast({
      title: 'Personal Information Updated',
      description: 'Your information has been saved successfully.',
    });
  };

  const handleCancelProfile = () => {
    setTempProfile(profile);
    setIsEditingProfile(false);
  };

  const handleCancelPersonal = () => {
    setTempProfile(profile);
    setIsEditingPersonal(false);
  };

  // Handle avatar upload to Supabase Storage
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, GIF)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
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

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const updatedProfile = { ...tempProfile, avatarUrl: publicUrl };
      setTempProfile(updatedProfile);
      setProfile(updatedProfile);
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));

      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been uploaded successfully.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole="Free Plan"
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === 'dashboard') navigate('/dashboard');
          else if (id === 'generate') navigate('/generate');
          else if (id === 'generative-ai') navigate('/generative-ai');
          else if (id === 'templates') navigate('/templates');
          else if (id === 'bookmarks') navigate('/templates?bookmarks=true');
          else if (id === 'history') navigate('/history');
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
            </div>

            {/* My Profile Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">My Profile</h2>

              {/* Profile Card - Floating */}
              <motion.div
                className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar with Upload */}
                    <div className="relative group">
                      <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                        <AvatarImage src={tempProfile.avatarUrl} alt={`${tempProfile.firstName} ${tempProfile.lastName}`} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {tempProfile.firstName[0]}{tempProfile.lastName[0] || tempProfile.firstName[1] || ''}
                        </AvatarFallback>
                      </Avatar>
                      {/* Upload overlay - always visible on hover */}
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
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Name & Role */}
                    <div>
                      {isEditingProfile ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={tempProfile.firstName}
                              onChange={(e) => setTempProfile({ ...tempProfile, firstName: e.target.value })}
                              placeholder="First Name"
                              className="h-9 w-32"
                            />
                            <Input
                              value={tempProfile.lastName}
                              onChange={(e) => setTempProfile({ ...tempProfile, lastName: e.target.value })}
                              placeholder="Last Name"
                              className="h-9 w-32"
                            />
                          </div>
                          <Input
                            value={tempProfile.location}
                            onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                            placeholder="City, State, Country"
                            className="h-9 w-full"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold text-foreground">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          <p className="text-primary font-medium">{profile.role}</p>
                          {profile.location && (
                            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {profile.location}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div>
                    {isEditingProfile ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelProfile}
                          className="gap-1"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          className="gap-1"
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                        className="gap-1"
                      >
                        Edit
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Personal Information Section - Floating */}
            <motion.div
              className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                {isEditingPersonal ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelPersonal}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePersonal}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPersonal(true)}
                    className="gap-1"
                  >
                    Edit
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  {isEditingPersonal ? (
                    <Input
                      value={tempProfile.firstName}
                      onChange={(e) => setTempProfile({ ...tempProfile, firstName: e.target.value })}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.firstName || 'Not set'}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  {isEditingPersonal ? (
                    <Input
                      value={tempProfile.lastName}
                      onChange={(e) => setTempProfile({ ...tempProfile, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.lastName || 'Not set'}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  {isEditingPersonal ? (
                    <Input
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                      placeholder="Enter email"
                      type="email"
                      disabled
                      className="bg-muted/50"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.email || 'Not set'}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  {isEditingPersonal ? (
                    <Input
                      value={tempProfile.phone}
                      onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.phone || 'Not set'}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </Label>
                  {isEditingPersonal ? (
                    <select
                      value={tempProfile.role}
                      onChange={(e) => setTempProfile({ ...tempProfile, role: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Educator">Educator</option>
                      <option value="Tutor">Tutor</option>
                      <option value="Content Creator">Content Creator</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-foreground font-medium">{profile.role || 'Student'}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  {isEditingPersonal ? (
                    <Input
                      value={tempProfile.location}
                      onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                      placeholder="City, State, Country"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              className="mt-6 bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ y: -2 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Account</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                >
                  Sign Out
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    toast({
                      title: 'Coming Soon',
                      description: 'Account deletion will be available soon.',
                    });
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
