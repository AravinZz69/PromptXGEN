import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Star, 
  FileText, 
  Sparkles,
  ArrowRight,
  Wand2,
  Clock,
  History,
  LayoutTemplate,
  ChevronRight,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Get user initials
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Load bookmark count from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('templateBookmarks');
    if (savedBookmarks) {
      setBookmarkCount(JSON.parse(savedBookmarks).length);
    }
  }, []);

  // Stats data
  const usageThisMonth = 0;
  const maxUsage = 10;
  const templatesUsed = 0;
  const currentPlan = 'Free';

  // Popular templates data
  const popularTemplates = [
    { id: 1, name: 'Essay Outline Generator', uses: 2847, category: 'Writing' },
    { id: 2, name: 'Concept Explainer', uses: 2156, category: 'Learning' },
    { id: 3, name: 'JEE Physics Problem Solver', uses: 1893, category: 'JEE' },
    { id: 4, name: 'UPSC Answer Framework', uses: 1654, category: 'UPSC' },
    { id: 5, name: 'Code Debugger Pro', uses: 1432, category: 'Coding' },
  ];

  // Recent generations (empty for new users)
  const recentGenerations: any[] = [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Always visible, expands on hover */}
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
          else if (id === 'analytics') navigate('/analytics');
          else if (id === 'profile') navigate('/profile');
          else if (id === 'settings') navigate('/settings');
          else if (id === 'upgrade') navigate('/upgrade');
        }}
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <div className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Welcome back, {userName}!</h1>
              <p className="text-muted-foreground">
                Ready to create amazing academic content?
              </p>
            </div>
            <Button 
              onClick={() => navigate('/generate')}
              className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Wand2 className="h-4 w-4" />
              New Generation
            </Button>
          </motion.div>

          {/* Action Cards - Top Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Generate Content */}
            <div 
              className="group bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
              onClick={() => navigate('/generate')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Wand2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Generate Content</h3>
                    <p className="text-sm text-muted-foreground">Start creating academic content</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-center gap-2 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Browse Templates */}
            <div 
              className="group bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
              onClick={() => navigate('/templates')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <LayoutTemplate className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Browse Templates</h3>
                    <p className="text-sm text-muted-foreground">Explore all available templates</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-center gap-2 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all duration-300"
                >
                  View All
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* View History */}
            <div 
              className="group bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
              onClick={() => navigate('/history')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <History className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">View History</h3>
                    <p className="text-sm text-muted-foreground">Access your past generations</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-center gap-2 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all duration-300"
                >
                  Open History
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Usage This Month */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Usage This Month</p>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mb-2">{usageThisMonth}/{maxUsage}</p>
              <div className="w-full h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(usageThisMonth / maxUsage) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{maxUsage - usageThisMonth} generations remaining</p>
            </div>

            {/* Favorites */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Favorites</p>
                <Star className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mb-2">{bookmarkCount}</p>
              <p className="text-xs text-muted-foreground">Saved prompts</p>
            </div>

            {/* Templates Used */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Templates Used</p>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mb-2">{templatesUsed}</p>
              <p className="text-xs text-muted-foreground">Different templates</p>
            </div>

            {/* Current Plan */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Current Plan</p>
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mb-2">{currentPlan}</p>
              <button 
                onClick={() => navigate('/upgrade')}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group"
              >
                Upgrade to Pro
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Recent Generations & Popular Templates */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Generations */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Recent Generations</h2>
                  <p className="text-sm text-muted-foreground">Your latest created content</p>
                </div>
                <button 
                  onClick={() => navigate('/history')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                </button>
              </div>
              
              {recentGenerations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No generations yet. Start creating!</p>
                  <Button 
                    onClick={() => navigate('/generate')}
                    variant="outline"
                    className="gap-2 hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    <Zap className="h-4 w-4" />
                    Create Your First
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentGenerations.map((gen, index) => (
                    <div 
                      key={gen.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{gen.title}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Templates */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Popular Templates</h2>
                  <p className="text-sm text-muted-foreground">Most used by the community</p>
                </div>
                <button 
                  onClick={() => navigate('/templates')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse all
                </button>
              </div>
              
              <div className="space-y-2">
                {popularTemplates.map((template, index) => (
                  <motion.div 
                    key={template.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate('/templates')}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-blue-400 transition-colors">
                          {template.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {template.uses.toLocaleString()} uses this week
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-5 flex flex-col items-center gap-3 hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
                onClick={() => navigate('/generate')}
              >
                <Wand2 className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm">Generate Prompt</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-5 flex flex-col items-center gap-3 hover:border-blue-400/50 hover:shadow-md transition-all duration-300 group"
                onClick={() => navigate('/templates')}
              >
                <FileText className="h-7 w-7 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Browse Templates</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-5 flex flex-col items-center gap-3 hover:border-yellow-400/50 hover:shadow-md transition-all duration-300 group"
                onClick={() => navigate('/templates?bookmarks=true')}
              >
                <Star className="h-7 w-7 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm">My Favorites</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-5 flex flex-col items-center gap-3 hover:border-purple-400/50 hover:shadow-md transition-all duration-300 group"
                onClick={() => navigate('/upgrade')}
              >
                <Sparkles className="h-7 w-7 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Upgrade Plan</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
