import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  MessageSquare,
  DollarSign,
  Clock,
  ArrowUpRight,
  X,
  UserPlus,
  Zap,
  Banknote,
  ArrowDown,
  Loader2,
  RefreshCw,
  TrendingUp,
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
import { supabase } from '@/lib/supabase';

const activityIcons = {
  upgrade: ArrowUpRight,
  signup: UserPlus,
  prompt: Zap,
  payment: Banknote,
  downgrade: ArrowDown,
};

const activityColors = {
  upgrade: 'text-emerald-400 bg-emerald-400/10',
  signup: 'text-blue-400 bg-blue-400/10',
  prompt: 'text-primary bg-primary/10',
  payment: 'text-amber-400 bg-amber-400/10',
  downgrade: 'text-red-400 bg-red-400/10',
};

const severityConfig = {
  info: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/20' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/20' },
  error: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20' },
};

function SkeletonCard() {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-muted/50 rounded-xl" />
        <div className="h-4 w-12 bg-muted/50 rounded-lg" />
      </div>
      <div className="h-7 w-20 bg-muted/50 rounded-lg mb-2" />
      <div className="h-3 w-16 bg-muted/50 rounded-lg" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
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
      let promptsData = [];
      let profilesData = [];
      
      try {
        const { data: adminPrompts } = await supabase.rpc('get_all_prompts_admin');
        if (adminPrompts && adminPrompts.length > 0) promptsData = adminPrompts;
      } catch (e) {
        console.log('Admin prompts RPC not available');
      }
      
      if (promptsData.length === 0) {
        const { data } = await supabase.from('prompt_history').select('created_at, user_id').order('created_at', { ascending: true });
        promptsData = data || [];
      }

      try {
        const { data: adminUsers } = await supabase.rpc('get_all_users_admin');
        if (adminUsers && adminUsers.length > 0) profilesData = adminUsers;
      } catch (e) {
        console.log('Admin users RPC not available');
      }
      
      if (profilesData.length === 0) {
        const { data } = await supabase.from('profiles').select('id, created_at, plan, email').order('created_at', { ascending: true });
        profilesData = data || [];
      }

      const totalUsers = profilesData.length;
      const totalPrompts = promptsData.length;
      const today = new Date().toISOString().split('T')[0];
      const promptsToday = promptsData.filter(p => p.created_at?.startsWith(today)).length;
      const usersToday = profilesData.filter(p => p.created_at?.startsWith(today)).length;

      // Calculate active subscriptions (pro + enterprise plans)
      const activeSubscriptions = profilesData.filter(p => {
        const plan = (p.plan || 'free').toLowerCase();
        return plan === 'pro' || plan === 'enterprise';
      }).length;

      // Calculate MRR (Monthly Recurring Revenue estimate)
      const planPrices = { pro: 9.99, enterprise: 49.99 };
      const mrr = profilesData.reduce((sum, p) => {
        const plan = (p.plan || 'free').toLowerCase();
        return sum + (planPrices[plan] || 0);
      }, 0);

      // Calculate total credits used
      const { data: creditDeductions } = await supabase
        .from('credit_transactions')
        .select('amount')
        .or('transaction_type.eq.deduction,amount.lt.0');
      const totalCreditsUsed = (creditDeductions || []).reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);
      
      setStats({
        total_users: totalUsers,
        total_prompts: totalPrompts,
        prompts_today: promptsToday,
        new_users_today: usersToday,
        active_subscriptions: activeSubscriptions,
        mrr: mrr,
        total_credits_used: totalCreditsUsed,
        new_users_week: profilesData.filter(p => {
          const created = new Date(p.created_at);
          return (Date.now() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length,
      });

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

      const weeklyMap = {};
      for (let i = 7; i >= 0; i--) weeklyMap[`W${8 - i}`] = 0;
      profilesData.forEach(p => {
        const created = new Date(p.created_at);
        const weekNum = Math.floor((Date.now() - created.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weekNum <= 7) {
          const weekKey = `W${8 - weekNum}`;
          if (weeklyMap[weekKey] !== undefined) weeklyMap[weekKey]++;
        }
      });
      setSignupsWeekly(Object.entries(weeklyMap).map(([week, signups]) => ({ week, signups })));

      const planCounts = { free: 0, pro: 0, enterprise: 0 };
      profilesData.forEach(p => {
        const plan = (p.plan || 'free').toLowerCase();
        if (planCounts[plan] !== undefined) planCounts[plan]++;
      });
      const total = planCounts.free + planCounts.pro + planCounts.enterprise || 1;
      setSubscriptionBreakdown([
        { name: 'Free', value: Math.round((planCounts.free / total) * 100), color: 'hsl(var(--muted-foreground))' },
        { name: 'Pro', value: Math.round((planCounts.pro / total) * 100), color: 'hsl(var(--primary))' },
        { name: 'Enterprise', value: Math.round((planCounts.enterprise / total) * 100), color: 'hsl(142 71% 45%)' },
      ]);

      const { data: creditsResult } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

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

      setAlerts([
        { id: 1, severity: 'info', message: 'Dashboard connected to live data', timestamp: 'Just now' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAlerts([
        { id: 1, severity: 'error', message: `Failed to load: ${error.message}`, timestamp: 'Just now' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  const dismissAlert = (id) => setAlerts(alerts.filter(a => a.id !== id));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border/50 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-foreground text-sm font-semibold">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  };

  const kpiData = stats ? [
    { title: 'Total Users', value: stats.total_users?.toLocaleString() || '0', change: '+' + (stats.new_users_week || 0), changeType: 'positive', icon: Users, color: 'blue' },
    { title: 'Active Subscriptions', value: stats.active_subscriptions?.toLocaleString() || '0', change: null, changeType: 'neutral', icon: CreditCard, color: 'green' },
    { title: 'Prompts Today', value: stats.prompts_today?.toLocaleString() || '0', change: null, changeType: 'neutral', icon: MessageSquare, color: 'indigo' },
    { title: 'MRR', value: '$' + (stats.mrr?.toLocaleString() || '0'), change: null, changeType: 'neutral', icon: DollarSign, color: 'emerald' },
    { title: 'Total Prompts', value: stats.total_prompts?.toLocaleString() || '0', change: null, changeType: 'neutral', icon: Clock, color: 'amber' },
  ] : [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back 👋</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your platform today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          kpiData.map((kpi, i) => <StatCard key={i} {...kpi} />)
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Prompt Generation" subtitle="Last 30 Days">
          <div className="h-72">
            {loading ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={promptsDaily}>
                  <defs>
                    <linearGradient id="promptGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="prompts" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#promptGradient)" name="Prompts" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="New Signups" subtitle="Last 8 Weeks">
          <div className="h-72">
            {loading ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupsWeekly}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Signups" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Subscription Breakdown */}
        <ChartCard title="Subscription Tiers">
          <div className="h-64">
            {loading ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subscriptionBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {subscriptionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* Quick Stats */}
        <ChartCard title="Quick Stats" subtitle="Live data">
          <div className="h-64 flex flex-col justify-center space-y-3">
            {loading ? <SkeletonChart /> : stats ? (
              <>
                {[
                  { label: 'Total Users', value: stats.total_users?.toLocaleString() || 0, icon: Users },
                  { label: 'Total Prompts', value: stats.total_prompts?.toLocaleString() || 0, icon: MessageSquare },
                  { label: 'New This Week', value: '+' + (stats.new_users_week || 0), icon: TrendingUp, highlight: true },
                  { label: 'Credits Used', value: stats.total_credits_used?.toLocaleString() || 0, icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-background/60 rounded-xl">
                    <div className="p-1.5 rounded-lg bg-muted/50">
                      <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.highlight ? 'text-emerald-400' : 'text-foreground'}`}>{item.value}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-muted-foreground text-center text-sm">No data</p>
            )}
          </div>
        </ChartCard>

        {/* System Status */}
        <ChartCard title="System Status">
          <div className="h-64 flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-3 p-3 bg-emerald-400/5 border border-emerald-500/15 rounded-xl">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-30" />
              </div>
              <span className="text-emerald-400 text-sm font-medium">Database Connected</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/60 rounded-xl">
              <span className="text-xs text-muted-foreground">Last Refresh</span>
              <span className="text-foreground text-xs ml-auto font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh Data
            </button>
          </div>
        </ChartCard>
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Recent Activity">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {loading ? <SkeletonChart /> : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">No recent activity</p>
            ) : (
              recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type] || Zap;
                const colorClass = activityColors[activity.type] || activityColors.prompt;
                
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-2.5 bg-background/40 hover:bg-background/70 rounded-xl transition-colors">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">
                        <span className="text-muted-foreground">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>

        <ChartCard title="System Alerts">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">No alerts</p>
            ) : (
              alerts.map((alert) => {
                const config = severityConfig[alert.severity] || severityConfig.info;
                return (
                  <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} ${config.border}`}>
                    <div className={`p-1 rounded-full ${config.bg} mt-0.5`}>
                      <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${config.color}`}>{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{alert.timestamp}</p>
                    </div>
                    <button onClick={() => dismissAlert(alert.id)} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                      <X className="w-3.5 h-3.5" />
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
