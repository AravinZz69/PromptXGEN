import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { getHistory, getRecentHistory, getFavorites, HistoryItem } from '@/lib/historyService';
import { getChatHistory, ChatConversation } from '@/lib/chatHistoryService';
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
  Zap,
  MessageSquare,
  Bot,
  Crown,
  Activity,
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { credits, isLoading: creditsLoading } = useCredits();
  
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<HistoryItem[]>([]);

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const history = getHistory();
    setHistoryItems(history);
    setRecentGenerations(getRecentHistory(5));
    setBookmarkCount(getFavorites().length);
    
    const savedBookmarks = localStorage.getItem('templateBookmarks');
    if (savedBookmarks) {
      const bookmarks = JSON.parse(savedBookmarks);
      setBookmarkCount(prev => Math.max(prev, bookmarks.length));
    }
    
    const loadChatHistory = async () => {
      try {
        setChatHistory(await getChatHistory());
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadChatHistory();
  }, []);

  const usedCredits = credits?.usedCredits || 0;
  const totalCredits = credits?.totalCredits || 20;
  const remainingCredits = credits?.remainingCredits || totalCredits;
  const currentPlan = credits?.planType === 'pro' ? 'Pro' : credits?.planType === 'enterprise' ? 'Enterprise' : 'Free';
  const creditPercent = Math.min((usedCredits / totalCredits) * 100, 100);

  const popularTemplates = [
    { id: 1, name: 'Essay Outline Generator', uses: 2847, category: 'Writing' },
    { id: 2, name: 'Concept Explainer', uses: 2156, category: 'Learning' },
    { id: 3, name: 'JEE Physics Problem Solver', uses: 1893, category: 'JEE' },
    { id: 4, name: 'UPSC Answer Framework', uses: 1654, category: 'UPSC' },
    { id: 5, name: 'Code Debugger Pro', uses: 1432, category: 'Coding' },
  ];

  const totalGenerations = historyItems.length + chatHistory.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userName={userName}
        userRole={`${currentPlan} Plan`}
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
        onLogout={() => { signOut(); navigate('/'); }}
      />

      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <div className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-7xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{greeting} 👋</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{userName}</h1>
                <p className="text-muted-foreground mt-1">Here's what's happening with your workspace</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/generative-ai')}
                  className="gap-2"
                >
                  <Bot className="h-4 w-4" />
                  AI Chat
                </Button>
                <Button 
                  onClick={() => navigate('/generate')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Wand2 className="h-4 w-4" />
                  New Generation
                </Button>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Credits */}
              <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Credits</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{remainingCredits}</p>
                <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${creditPercent > 80 ? 'bg-destructive' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${creditPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{usedCredits} of {totalCredits} used</p>
              </div>

              {/* Generations */}
              <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <Activity className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Generations</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalGenerations}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Total prompts & chats</p>
              </div>

              {/* Favorites */}
              <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-xl bg-yellow-500/10">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Favorites</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{bookmarkCount}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Saved prompts</p>
              </div>

              {/* Plan */}
              <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-xl bg-purple-500/10">
                    <Crown className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Plan</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{currentPlan}</p>
                {currentPlan === 'Free' && (
                  <button 
                    onClick={() => navigate('/upgrade')}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1.5 transition-colors group"
                  >
                    Upgrade now
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Action Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { 
                  title: 'Generate Content', desc: 'Create prompts with AI', icon: Wand2, 
                  color: 'blue', route: '/generate',
                  gradient: 'from-blue-500/10 to-blue-600/5', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400',
                  hoverBorder: 'hover:border-blue-500/40'
                },
                { 
                  title: 'Browse Templates', desc: 'Explore curated templates', icon: LayoutTemplate, 
                  color: 'emerald', route: '/templates',
                  gradient: 'from-emerald-500/10 to-emerald-600/5', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400',
                  hoverBorder: 'hover:border-emerald-500/40'
                },
                { 
                  title: 'AI Assistant', desc: 'Chat with our AI model', icon: Bot, 
                  color: 'purple', route: '/generative-ai',
                  gradient: 'from-purple-500/10 to-purple-600/5', iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400',
                  hoverBorder: 'hover:border-purple-500/40'
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`group bg-gradient-to-br ${card.gradient} border border-border rounded-2xl p-6 cursor-pointer ${card.hoverBorder} hover:shadow-lg transition-all duration-300`}
                  onClick={() => navigate(card.route)}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 ${card.iconBg} rounded-xl`}>
                      <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.desc}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-center gap-2 ${card.hoverBorder} transition-all duration-300`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ))}
            </motion.div>

            {/* Recent Activity & Popular Templates */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
                    <p className="text-sm text-muted-foreground">Your latest generations and chats</p>
                  </div>
                  <button onClick={() => navigate('/history')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    View all
                  </button>
                </div>
                
                {recentGenerations.length === 0 && chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-muted/50 rounded-full mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No generations yet. Start creating!</p>
                    <Button onClick={() => navigate('/generate')} variant="outline" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Create Your First
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentGenerations.slice(0, 3).map((gen) => (
                      <div 
                        key={gen.id}
                        onClick={() => navigate('/history')}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {gen.type === 'template' ? (
                            <div className="p-1.5 rounded-lg bg-blue-500/10"><FileText className="h-4 w-4 text-blue-400" /></div>
                          ) : (
                            <div className="p-1.5 rounded-lg bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-foreground">{gen.templateName || `${gen.promptType || 'Basic'} Prompt`}</span>
                            <p className="text-xs text-muted-foreground">{new Date(gen.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                    {chatHistory.slice(0, 2).map((chat) => (
                      <div 
                        key={chat.id}
                        onClick={() => navigate('/history')}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10"><MessageSquare className="h-4 w-4 text-emerald-400" /></div>
                          <div>
                            <span className="text-sm font-medium text-foreground">{chat.title}</span>
                            <p className="text-xs text-muted-foreground">{chat.messages.length} messages · {new Date(chat.created_at).toLocaleDateString()}</p>
                          </div>
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
                    <h2 className="text-xl font-semibold text-foreground">Popular Templates</h2>
                    <p className="text-sm text-muted-foreground">Most used by the community</p>
                  </div>
                  <button onClick={() => navigate('/templates')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Browse all
                  </button>
                </div>
                
                <div className="space-y-1">
                  {popularTemplates.map((template, index) => (
                    <motion.div 
                      key={template.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate('/templates')}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.uses.toLocaleString()} uses · {template.category}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Wand2, label: 'Generate Prompt', route: '/generate', color: 'text-primary' },
                  { icon: LayoutTemplate, label: 'Browse Templates', route: '/templates', color: 'text-blue-500' },
                  { icon: Star, label: 'My Favorites', route: '/templates?bookmarks=true', color: 'text-yellow-500' },
                  { icon: Sparkles, label: 'Upgrade Plan', route: '/upgrade', color: 'text-purple-500' },
                ].map((action) => (
                  <Button 
                    key={action.label}
                    variant="outline" 
                    className="h-auto p-5 flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
                    onClick={() => navigate(action.route)}
                  >
                    <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm text-foreground">{action.label}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
