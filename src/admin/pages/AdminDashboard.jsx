import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  MessageSquare,
  DollarSign,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  UserPlus,
  Zap,
  Banknote,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Badge from '../components/Badge';
import { supabase } from '@/lib/supabase';

const activityIcons = {
  upgrade: ArrowUpRight,
  signup: UserPlus,
  prompt: Zap,
  payment: Banknote,
  downgrade: ArrowDown,
};

const activityColors = {
  upgrade: 'text-emerald-400 bg-emerald-400/20',
  signup: 'text-blue-400 bg-blue-400/20',
  prompt: 'text-primary bg-primary/20',
  payment: 'text-amber-400 bg-amber-400/20',
  downgrade: 'text-red-400 bg-red-400/20',
};

const severityConfig = {
  info: { color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-500/30' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-500/30' },
  error: { color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-500/30' },
};

// Skeleton loader component
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="h-8 w-24 bg-muted rounded mb-2" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [promptsDaily, setPromptsDaily] = useState([]);
  const [signupsWeekly, setSignupsWeekly] = useState([]);
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Try to use admin RPC functions first, fallback to direct queries
      let promptsData = [];
      let profilesData = [];
      
      // Fetch prompts using admin function or direct query
      try {
        const { data: adminPrompts } = await supabase.rpc('get_all_prompts_admin');
        if (adminPrompts && adminPrompts.length > 0) {
          promptsData = adminPrompts;
        }
      } catch (e) {
        console.log('Admin prompts RPC not available, trying direct query');
      }
      
      if (promptsData.length === 0) {
        const { data } = await supabase
          .from('prompt_history')
          .select('created_at, user_id')
          .order('created_at', { ascending: true });
        promptsData = data || [];
      }

      // Fetch profiles using admin function or direct query
      try {
        const { data: adminUsers } = await supabase.rpc('get_all_users_admin');
        if (adminUsers && adminUsers.length > 0) {
          profilesData = adminUsers;
        }
      } catch (e) {
        console.log('Admin users RPC not available, trying direct query');
      }
      
      if (profilesData.length === 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, created_at, plan, email')
          .order('created_at', { ascending: true });
        profilesData = data || [];
      }

      // Calculate stats
      const totalUsers = profilesData.length;
      const totalPrompts = promptsData.length;
      const today = new Date().toISOString().split('T')[0];
      const promptsToday = promptsData.filter(p => p.created_at?.startsWith(today)).length;
      const usersToday = profilesData.filter(p => p.created_at?.startsWith(today)).length;
      
      setStats({
        total_users: totalUsers,
        total_prompts: totalPrompts,
        prompts_today: promptsToday,
        new_users_today: usersToday,
        new_users_week: profilesData.filter(p => {
          const created = new Date(p.created_at);
          return (Date.now() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length,
      });

      // Process prompts daily chart (last 30 days)
      const dailyMap = {};
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyMap[key] = 0;
      }
      
      promptsData.forEach(p => {
        const created = new Date(p.created_at);
        if (Date.now() - created.getTime() <= 30 * 24 * 60 * 60 * 1000) {
          const key = created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (dailyMap[key] !== undefined) dailyMap[key]++;
        }
      });
      setPromptsDaily(Object.entries(dailyMap).map(([date, prompts]) => ({ date, prompts })));

      // Process signups weekly chart (last 8 weeks)
      const weeklyMap = {};
      for (let i = 7; i >= 0; i--) {
        weeklyMap[`W${8 - i}`] = 0;
      }
      
      profilesData.forEach(p => {
        const created = new Date(p.created_at);
        const weekNum = Math.floor((Date.now() - created.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weekNum <= 7) {
          const weekKey = `W${8 - weekNum}`;
          if (weeklyMap[weekKey] !== undefined) weeklyMap[weekKey]++;
        }
      });
      setSignupsWeekly(Object.entries(weeklyMap).map(([week, signups]) => ({ week, signups })));

      // Process subscription breakdown
      const planCounts = { free: 0, pro: 0, enterprise: 0 };
      profilesData.forEach(p => {
        const plan = (p.plan || 'free').toLowerCase();
        if (planCounts[plan] !== undefined) planCounts[plan]++;
      });
      const total = planCounts.free + planCounts.pro + planCounts.enterprise || 1;
      setSubscriptionBreakdown([
        { name: 'Free', value: Math.round((planCounts.free / total) * 100), color: '#6B7280' },
        { name: 'Pro', value: Math.round((planCounts.pro / total) * 100), color: '#6366F1' },
        { name: 'Enterprise', value: Math.round((planCounts.enterprise / total) * 100), color: '#10B981' },
      ]);

      // Fetch recent activity from credit transactions
      const { data: creditsResult } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (creditsResult) {
        const activity = creditsResult.map((t, i) => {
          const types = {
            deduction: { type: 'prompt', action: 'used credits' },
            topup: { type: 'payment', action: 'added credits' },
            bonus: { type: 'signup', action: 'received bonus' },
            admin_grant: { type: 'payment', action: 'admin grant' },
          };
          const info = types[t.transaction_type] || { type: 'prompt', action: t.description || 'activity' };
          const timeAgo = getTimeAgo(new Date(t.created_at));
          // Find user email from profilesData
          const user = profilesData.find(p => p.user_id === t.user_id || p.id === t.user_id);
          return {
            id: t.id || i,
            type: info.type,
            user: user?.email || 'Unknown user',
            action: `${info.action} (${Math.abs(t.amount)} credits)`,
            time: timeAgo,
          };
        });
        setRecentActivity(activity);
      }

      // Set alerts
      setAlerts([
        { id: 1, severity: 'info', message: 'Dashboard connected to live Supabase data', timestamp: 'Just now' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAlerts([
        { id: 1, severity: 'error', message: `Failed to load data: ${error.message}`, timestamp: 'Just now' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-white text-sm font-medium">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  };

  // Build KPI data from stats
  const kpiData = stats ? [
    { title: 'Total Users', value: stats.total_users?.toLocaleString() || '0', change: '+' + (stats.new_users_week || 0), changeType: 'positive', icon: Users, color: 'blue' },
    { title: 'Active Subscriptions', value: stats.active_subscriptions?.toLocaleString() || '0', change: '-', changeType: 'neutral', icon: CreditCard, color: 'green' },
    { title: 'Prompts Today', value: stats.prompts_today?.toLocaleString() || '0', change: '-', changeType: 'neutral', icon: MessageSquare, color: 'indigo' },
    { title: 'MRR', value: '$' + (stats.mrr?.toLocaleString() || '0'), change: '-', changeType: 'neutral', icon: DollarSign, color: 'emerald' },
    { title: 'Total Prompts', value: stats.total_prompts?.toLocaleString() || '0', change: '-', changeType: 'neutral', icon: Clock, color: 'amber' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          kpiData.map((kpi, i) => (
            <StatCard key={i} {...kpi} />
          ))
        )}
      </div>

      {/* Row 2 - Charts (2 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt Generation - Last 30 Days */}
        <ChartCard title="Prompt Generation" subtitle="Last 30 Days">
          <div className="h-72">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={promptsDaily}>
                  <defs>
                    <linearGradient id="promptGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="prompts"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fill="url(#promptGradient)"
                    name="Prompts"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* New Signups Per Week */}
        <ChartCard title="New Signups Per Week" subtitle="Last 8 Weeks">
          <div className="h-72">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupsWeekly}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="signups" fill="#6366F1" radius={[4, 4, 0, 0]} name="Signups" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Row 3 - Charts (3 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Tier Breakdown */}
        <ChartCard title="Subscription Tier Breakdown">
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subscriptionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* Stats Summary */}
        <ChartCard title="Quick Stats" subtitle="Live from database">
          <div className="h-64 flex flex-col justify-center space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : stats ? (
              <>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-muted-foreground">Total Users</span>
                  <span className="text-white font-semibold">{stats.total_users?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-muted-foreground">Total Prompts</span>
                  <span className="text-white font-semibold">{stats.total_prompts?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-muted-foreground">New This Week</span>
                  <span className="text-emerald-400 font-semibold">+{stats.new_users_week || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-muted-foreground">Credits Used</span>
                  <span className="text-white font-semibold">{stats.total_credits_used?.toLocaleString() || 0}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center">No data available</p>
            )}
          </div>
        </ChartCard>

        {/* Database Connection Status */}
        <ChartCard title="System Status">
          <div className="h-64 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-400/10 border border-emerald-500/30 rounded-lg">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400">Supabase Connected</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <span className="text-muted-foreground">Last Refresh</span>
              <span className="text-white ml-auto">{new Date().toLocaleTimeString()}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Refresh Data
            </button>
          </div>
        </ChartCard>
      </div>

      {/* Row 4 - Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <ChartCard title="Recent Activity Feed">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type] || Zap;
                const colorClass = activityColors[activity.type] || activityColors.prompt;
                
                return (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-background rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        <span className="text-muted-foreground">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>

        {/* System Alerts */}
        <ChartCard title="System Alerts">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No alerts</p>
            ) : (
              alerts.map((alert) => {
                const config = severityConfig[alert.severity] || severityConfig.info;
                
                return (
                  <div 
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}
                  >
                    <div className={`p-1.5 rounded-full ${config.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${config.color}`}>{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-muted-foreground hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
