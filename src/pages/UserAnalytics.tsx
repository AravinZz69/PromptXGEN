import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserAnalytics, 
  getPromptHistoryStats, 
  getCreditTransactions,
  getUserCredits,
  type UserAnalytics as UserAnalyticsType
} from '@/lib/profileService';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  TrendingUp,
  Zap,
  FileText,
  CreditCard,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  color: string;
}

const StatsCard = ({ title, value, subtitle, icon: Icon, trend, color }: StatsCardProps) => (
  <motion.div
    className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    whileHover={{ y: -2 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{trend.value}% from last week</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const UserAnalytics = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UserAnalyticsType | null>(null);
  const [promptStats, setPromptStats] = useState<{
    totalPrompts: number;
    promptsByType: Record<string, number>;
    promptsByModel: Record<string, number>;
    recentActivity: Array<{ date: string; count: number }>;
  } | null>(null);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    amount: number;
    transaction_type: string;
    description: string;
    created_at: string;
  }>>([]);
  const [credits, setCredits] = useState<{ balance: number; plan: string; used: number; total: number } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [analyticsData, statsData, transactionsData, creditsData] = await Promise.all([
        getUserAnalytics(user.id),
        getPromptHistoryStats(user.id),
        getCreditTransactions(user.id, 10),
        getUserCredits(user.id),
      ]);

      setAnalytics(analyticsData);
      setPromptStats(statsData);
      setTransactions(transactionsData);
      
      if (creditsData) {
        setCredits({
          balance: creditsData.credits_balance,
          plan: creditsData.plan_type,
          used: creditsData.used_credits,
          total: creditsData.total_credits,
        });
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, loadAnalytics]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'bonus':
      case 'topup':
      case 'refund':
      case 'admin_grant':
        return 'text-green-500';
      case 'deduction':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return '🎁';
      case 'topup':
        return '💳';
      case 'refund':
        return '↩️';
      case 'deduction':
        return '⚡';
      case 'admin_grant':
        return '👑';
      default:
        return '💰';
    }
  };

  // Calculate activity chart data
  const activityData = promptStats?.recentActivity || [];
  const maxActivity = Math.max(...activityData.map(a => a.count), 1);

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

        <main className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">My Analytics</h1>
              <p className="text-muted-foreground mt-1">Track your usage and activity statistics</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatsCard
                    title="Total Prompts"
                    value={analytics?.total_prompts_generated || promptStats?.totalPrompts || 0}
                    subtitle="All time"
                    icon={FileText}
                    color="from-blue-500 to-blue-600"
                  />
                  <StatsCard
                    title="Credits Used"
                    value={credits?.used || analytics?.total_credits_spent || 0}
                    subtitle={`of ${credits?.total || 0} total`}
                    icon={Zap}
                    color="from-purple-500 to-purple-600"
                  />
                  <StatsCard
                    title="This Month"
                    value={analytics?.prompts_this_month || 0}
                    subtitle="Prompts generated"
                    icon={Calendar}
                    color="from-green-500 to-green-600"
                  />
                  <StatsCard
                    title="This Week"
                    value={analytics?.prompts_this_week || 0}
                    subtitle="Prompts generated"
                    icon={TrendingUp}
                    color="from-orange-500 to-orange-600"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Activity Chart */}
                  <motion.div
                    className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Activity className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Activity (Last 30 Days)</h3>
                    </div>
                    
                    {activityData.length > 0 ? (
                      <div className="flex items-end gap-1 h-40">
                        {activityData.map((day, index) => (
                          <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <div
                              className="w-full bg-primary/80 rounded-t-sm hover:bg-primary transition-colors cursor-pointer"
                              style={{ height: `${(day.count / maxActivity) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                              title={`${day.date}: ${day.count} prompts`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        <p>No activity data available</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>30 days ago</span>
                      <span>Today</span>
                    </div>
                  </motion.div>

                  {/* Usage by Type */}
                  <motion.div
                    className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <PieChart className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Usage by Prompt Type</h3>
                    </div>
                    
                    {promptStats && Object.keys(promptStats.promptsByType).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(promptStats.promptsByType)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([type, count], index) => {
                            const total = Object.values(promptStats.promptsByType).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                            const colors = [
                              'bg-blue-500',
                              'bg-purple-500',
                              'bg-green-500',
                              'bg-orange-500',
                              'bg-pink-500',
                            ];
                            return (
                              <div key={type}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-foreground capitalize">{type}</span>
                                  <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${colors[index % colors.length]} rounded-full transition-all`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        <p>No usage data available</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Model Usage & Credit History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Model Usage */}
                  <motion.div
                    className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Model Usage</h3>
                    </div>
                    
                    {promptStats && Object.keys(promptStats.promptsByModel).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(promptStats.promptsByModel)
                          .sort(([, a], [, b]) => b - a)
                          .map(([model, count]) => {
                            const total = Object.values(promptStats.promptsByModel).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                              <div key={model} className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-foreground">{model}</span>
                                    <span className="text-sm text-muted-foreground">{count}</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        <p>No model usage data available</p>
                      </div>
                    )}
                    
                    {analytics?.favorite_model && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          Favorite Model: <span className="text-foreground font-medium">{analytics.favorite_model}</span>
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Credit Transactions */}
                  <motion.div
                    className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Recent Credit Activity</h3>
                    </div>
                    
                    {transactions.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{getTransactionIcon(tx.transaction_type)}</span>
                              <div>
                                <p className="text-sm text-foreground font-medium">
                                  {tx.description || tx.transaction_type}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(tx.created_at)}
                                </p>
                              </div>
                            </div>
                            <span className={`font-semibold ${getTransactionColor(tx.transaction_type)}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        <p>No credit transactions yet</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Credits Summary Card */}
                {credits && (
                  <motion.div
                    className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6 mt-6"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                          <Sparkles className="h-8 w-8 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">Credits Balance</h3>
                          <p className="text-muted-foreground">
                            You have <span className="text-purple-400 font-bold">{credits.balance}</span> credits remaining
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{credits.used}</p>
                          <p className="text-xs text-muted-foreground">Used</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{credits.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400 capitalize">{credits.plan}</p>
                          <p className="text-xs text-muted-foreground">Plan</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserAnalytics;
