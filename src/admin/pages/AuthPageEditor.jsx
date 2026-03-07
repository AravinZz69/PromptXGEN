/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AuthPageEditor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing Login & Signup page content
 * - Login page headings, logo, branding
 * - Signup page steps, roles, use cases
 * - Social login button visibility
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import useCmsConfig from '@/admin/hooks/useCmsConfig';
import DraggableList from '@/admin/components/cms/DraggableList';

// Default auth page configuration
const DEFAULT_AUTH_CONFIG = {
  // Login Page
  login: {
    logoUrl: '/askjai-logo.png',
    siteName: 'AskJai',
    heading: 'Welcome back!',
    subheading: 'Please enter your details to sign in',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    rememberMeLabel: 'Remember me',
    forgotPasswordText: 'Forgot password?',
    submitButtonText: 'Sign In',
    signupPrompt: "Don't have an account?",
    signupLinkText: 'Sign up',
    // Social logins
    showGoogleLogin: true,
    showGitHubLogin: true,
    googleButtonText: 'Continue with Google',
    githubButtonText: 'Continue with GitHub',
    orDividerText: 'or continue with',
    // Left panel (animated characters side)
    leftPanelLinks: [
      { id: '1', label: 'Privacy Policy', url: '/terms?tab=privacy' },
      { id: '2', label: 'Terms of Service', url: '/terms' },
      { id: '3', label: 'Contact', url: '/contact' },
    ],
  },
  // Signup Page
  signup: {
    logoUrl: '/askjai-logo.png',
    siteName: 'AskJai',
    heading: 'Create your account',
    subheading: 'Start generating powerful AI prompts',
    // Step 1 - Personal Info
    step1Title: "Let's get started",
    step1Subtitle: 'Tell us a bit about yourself',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    mobileLabel: 'Mobile (optional)',
    mobilePlaceholder: '+1 (555) 000-0000',
    cityLabel: 'City (optional)',
    cityPlaceholder: 'San Francisco',
    // Step 2 - Role
    step2Title: 'What describes you best?',
    step2Subtitle: 'This helps us personalize your experience',
    roles: [
      { id: 'developer', title: 'Developer', description: 'Building apps & software', icon: 'Code' },
      { id: 'writer', title: 'Writer / Content Creator', description: 'Creating articles & content', icon: 'Pencil' },
      { id: 'marketer', title: 'Marketer', description: 'Marketing & campaigns', icon: 'Briefcase' },
      { id: 'student', title: 'Student', description: 'Learning & research', icon: 'GraduationCap' },
      { id: 'other', title: 'Other', description: 'Something else entirely', icon: 'Sparkles' },
    ],
    // Step 3 - Use Case
    step3Title: "What will you use AskJai for?",
    step3Subtitle: 'Select all that apply',
    useCases: [
      { id: 'coding', title: 'Code Generation', description: 'Write code faster' },
      { id: 'writing', title: 'Content Writing', description: 'Blog posts, articles' },
      { id: 'images', title: 'Image Generation', description: 'Create AI artwork' },
      { id: 'analysis', title: 'Data Analysis', description: 'Insights & reports' },
      { id: 'chatbot', title: 'Chatbot Building', description: 'Conversational AI' },
      { id: 'other', title: 'Other', description: 'Something unique' },
    ],
    // Step 4 - Experience
    step4Title: 'Your AI experience level?',
    step4Subtitle: 'We\'ll tailor recommendations accordingly',
    experienceLevels: [
      { id: 'beginner', label: 'Beginner', description: 'Just getting started with AI' },
      { id: 'intermediate', label: 'Intermediate', description: 'Some experience with prompts' },
      { id: 'expert', label: 'Expert', description: 'Advanced prompt engineering' },
    ],
    // Step 5 - Password
    step5Title: 'Secure your account',
    step5Subtitle: 'Create a strong password',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Create a password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    termsText: 'I agree to the',
    termsLinkText: 'Terms of Service',
    privacyText: 'and',
    privacyLinkText: 'Privacy Policy',
    // Buttons
    nextButtonText: 'Continue',
    backButtonText: 'Back',
    submitButtonText: 'Create Account',
    loginPrompt: 'Already have an account?',
    loginLinkText: 'Sign in',
    // Social
    showGoogleLogin: true,
    showGitHubLogin: true,
  },
  // Forgot Password Page
  forgotPassword: {
    heading: 'Reset Password',
    subheading: "We'll send you a reset link to your email",
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    submitButtonText: 'Send Reset Link',
    backToLoginText: 'Back to sign in',
    successMessage: 'Check your email for the password reset link.',
  },
};

export function AuthPageEditor() {
  const { data, loading, saving, save } = useCmsConfig('auth_pages');
  const [config, setConfig] = useState(DEFAULT_AUTH_CONFIG);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setConfig({ ...DEFAULT_AUTH_CONFIG, ...data });
    }
  }, [data]);

  const handleSave = async () => {
    await save(config);
  };

  const updateLogin = (field, value) => {
    setConfig(prev => ({
      ...prev,
      login: { ...prev.login, [field]: value },
    }));
  };

  const updateSignup = (field, value) => {
    setConfig(prev => ({
      ...prev,
      signup: { ...prev.signup, [field]: value },
    }));
  };

  const updateForgotPassword = (field, value) => {
    setConfig(prev => ({
      ...prev,
      forgotPassword: { ...prev.forgotPassword, [field]: value },
    }));
  };

  // Role management
  const addRole = () => {
    const newRole = {
      id: Date.now().toString(),
      title: 'New Role',
      description: 'Description here',
      icon: 'Sparkles',
    };
    updateSignup('roles', [...config.signup.roles, newRole]);
  };

  const updateRole = (id, field, value) => {
    const updated = config.signup.roles.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    );
    updateSignup('roles', updated);
  };

  const deleteRole = (id) => {
    updateSignup('roles', config.signup.roles.filter(r => r.id !== id));
  };

  // Use case management
  const addUseCase = () => {
    const newUseCase = {
      id: Date.now().toString(),
      title: 'New Use Case',
      description: 'Description here',
    };
    updateSignup('useCases', [...config.signup.useCases, newUseCase]);
  };

  const updateUseCase = (id, field, value) => {
    const updated = config.signup.useCases.map(u =>
      u.id === id ? { ...u, [field]: value } : u
    );
    updateSignup('useCases', updated);
  };

  const deleteUseCase = (id) => {
    updateSignup('useCases', config.signup.useCases.filter(u => u.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Auth Page Editor</h1>
          <p className="text-gray-400 text-sm">
            Customize login, signup, and password reset pages
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="login" className="data-[state=active]:bg-indigo-600">
            Login Page
          </TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-indigo-600">
            Signup Page
          </TabsTrigger>
          <TabsTrigger value="forgot" className="data-[state=active]:bg-indigo-600">
            Forgot Password
          </TabsTrigger>
        </TabsList>

        {/* LOGIN TAB */}
        <TabsContent value="login" className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Branding & Content</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={config.login.logoUrl}
                  onChange={(e) => updateLogin('logoUrl', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                  placeholder="/askjai-logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={config.login.siteName}
                  onChange={(e) => updateLogin('siteName', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={config.login.heading}
                  onChange={(e) => updateLogin('heading', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subheading
                </label>
                <input
                  type="text"
                  value={config.login.subheading}
                  onChange={(e) => updateLogin('subheading', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Submit Button Text
                </label>
                <input
                  type="text"
                  value={config.login.submitButtonText}
                  onChange={(e) => updateLogin('submitButtonText', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forgot Password Text
                </label>
                <input
                  type="text"
                  value={config.login.forgotPasswordText}
                  onChange={(e) => updateLogin('forgotPasswordText', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <h3 className="text-md font-semibold text-white mt-6">Social Login</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={config.login.showGoogleLogin}
                  onCheckedChange={(val) => updateLogin('showGoogleLogin', val)}
                />
                <span className="text-gray-300">Show Google Login</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={config.login.showGitHubLogin}
                  onCheckedChange={(val) => updateLogin('showGitHubLogin', val)}
                />
                <span className="text-gray-300">Show GitHub Login</span>
              </div>
            </div>

            {config.login.showGoogleLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Google Button Text
                </label>
                <input
                  type="text"
                  value={config.login.googleButtonText}
                  onChange={(e) => updateLogin('googleButtonText', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            )}

            {config.login.showGitHubLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Button Text
                </label>
                <input
                  type="text"
                  value={config.login.githubButtonText}
                  onChange={(e) => updateLogin('githubButtonText', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* SIGNUP TAB */}
        <TabsContent value="signup" className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={config.signup.heading}
                  onChange={(e) => updateSignup('heading', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subheading
                </label>
                <input
                  type="text"
                  value={config.signup.subheading}
                  onChange={(e) => updateSignup('subheading', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Roles */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">User Roles (Step 2)</h2>
              <Button
                onClick={addRole}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Role
              </Button>
            </div>
            <div className="space-y-3">
              {config.signup.roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-3"
                >
                  <GripVertical className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={role.title}
                    onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                    placeholder="Role Title"
                  />
                  <input
                    type="text"
                    value={role.description}
                    onChange={(e) => updateRole(role.id, 'description', e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    value={role.icon}
                    onChange={(e) => updateRole(role.id, 'icon', e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                    placeholder="Icon"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRole(role.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Use Cases (Step 3)</h2>
              <Button
                onClick={addUseCase}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Use Case
              </Button>
            </div>
            <div className="space-y-3">
              {config.signup.useCases.map((useCase) => (
                <div
                  key={useCase.id}
                  className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-3"
                >
                  <GripVertical className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={useCase.title}
                    onChange={(e) => updateUseCase(useCase.id, 'title', e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={useCase.description}
                    onChange={(e) => updateUseCase(useCase.id, 'description', e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 text-sm"
                    placeholder="Description"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteUseCase(useCase.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Step Titles */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Step Titles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Step 1 Title
                </label>
                <input
                  type="text"
                  value={config.signup.step1Title}
                  onChange={(e) => updateSignup('step1Title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Step 2 Title
                </label>
                <input
                  type="text"
                  value={config.signup.step2Title}
                  onChange={(e) => updateSignup('step2Title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Step 3 Title
                </label>
                <input
                  type="text"
                  value={config.signup.step3Title}
                  onChange={(e) => updateSignup('step3Title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Step 4 Title
                </label>
                <input
                  type="text"
                  value={config.signup.step4Title}
                  onChange={(e) => updateSignup('step4Title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Step 5 Title
                </label>
                <input
                  type="text"
                  value={config.signup.step5Title}
                  onChange={(e) => updateSignup('step5Title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* FORGOT PASSWORD TAB */}
        <TabsContent value="forgot" className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Forgot Password Page</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={config.forgotPassword.heading}
                  onChange={(e) => updateForgotPassword('heading', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subheading
                </label>
                <input
                  type="text"
                  value={config.forgotPassword.subheading}
                  onChange={(e) => updateForgotPassword('subheading', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Submit Button Text
                </label>
                <input
                  type="text"
                  value={config.forgotPassword.submitButtonText}
                  onChange={(e) => updateForgotPassword('submitButtonText', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Back to Login Text
                </label>
                <input
                  type="text"
                  value={config.forgotPassword.backToLoginText}
                  onChange={(e) => updateForgotPassword('backToLoginText', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Success Message
                </label>
                <input
                  type="text"
                  value={config.forgotPassword.successMessage}
                  onChange={(e) => updateForgotPassword('successMessage', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuthPageEditor;
