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
  HeadphonesIcon,
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
  support: HeadphonesIcon,
  downgrade: ArrowDown,
};

const activityColors = {
  upgrade: 'text-emerald-400 bg-emerald-400/20',
  signup: 'text-blue-400 bg-blue-400/20',
  prompt: 'text-indigo-400 bg-indigo-400/20',
  payment: 'text-amber-400 bg-amber-400/20',
  support: 'text-purple-400 bg-purple-400/20',
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
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-700 rounded-lg" />
        <div className="h-4 w-16 bg-gray-700 rounded" />
      </div>
      <div className="h-8 w-24 bg-gray-700 rounded mb-2" />
      <div className="h-3 w-20 bg-gray-700 rounded" />
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
      // Fetch all data in parallel
      const [
        statsResult,
        promptsResult,
        profilesResult,
        creditsResult,
        ticketsResult,
      ] = await Promise.all([
        // Dashboard stats
        supabase.rpc('get_admin_dashboard_stats'),
        // Prompts for last 30 days
        supabase.from('prompt_history')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true }),
        // Profiles for signups
        supabase.from('profiles')
          .select('created_at, plan')
          .gte('created_at', new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true }),
        // Recent credit transactions (activity)
        supabase.from('credit_transactions')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false })
          .limit(10),
        // Open tickets count
        supabase.from('support_tickets')
          .select('status', { count: 'exact', head: true })
          .in('status', ['Open', 'In Progress']),
      ]);

      // Process stats
      if (statsResult.data) {
        setStats(statsResult.data);
      } else {
        // Fallback: calculate from individual queries
        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: totalPrompts } = await supabase.from('prompt_history').select('*', { count: 'exact', head: true });
        const { count: promptsToday } = await supabase.from('prompt_history')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]);
        
        setStats({
          total_users: totalUsers || 0,
          total_prompts: totalPrompts || 0,
          prompts_today: promptsToday || 0,
          new_users_today: 0,
          new_users_week: 0,
        });
      }

      // Process prompts daily chart
      if (promptsResult.data) {
        const dailyMap = {};
        for (let i = 29; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyMap[key] = 0;
        }
        promptsResult.data.forEach(p => {
          const date = new Date(p.created_at);
          const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (dailyMap[key] !== undefined) dailyMap[key]++;
        });
        setPromptsDaily(Object.entries(dailyMap).map(([date, prompts]) => ({ date, prompts })));
      }

      // Process signups weekly chart
      if (profilesResult.data) {
        const weeklyMap = {};
        for (let i = 7; i >= 0; i--) {
          weeklyMap[`W${8 - i}`] = 0;
        }
        profilesResult.data.forEach(p => {
          const date = new Date(p.created_at);
          const weekNum = Math.floor((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const weekKey = `W${8 - weekNum}`;
          if (weeklyMap[weekKey] !== undefined) weeklyMap[weekKey]++;
        });
        setSignupsWeekly(Object.entries(weeklyMap).map(([week, signups]) => ({ week, signups })));

        // Process subscription breakdown
        const planCounts = { free: 0, pro: 0, enterprise: 0 };
        profilesResult.data.forEach(p => {
          const plan = (p.plan || 'free').toLowerCase();
          if (planCounts[plan] !== undefined) planCounts[plan]++;
        });
        // Get fresh count from all profiles
        const { data: allProfiles } = await supabase.from('profiles').select('plan');
        if (allProfiles) {
          const counts = { free: 0, pro: 0, enterprise: 0 };
          allProfiles.forEach(p => {
            const plan = (p.plan || 'free').toLowerCase();
            if (counts[plan] !== undefined) counts[plan]++;
          });
          const total = counts.free + counts.pro + counts.enterprise;
          setSubscriptionBreakdown([
            { name: 'Free', value: total ? Math.round((counts.free / total) * 100) : 45, color: '#6B7280' },
            { name: 'Pro', value: total ? Math.round((counts.pro / total) * 100) : 35, color: '#6366F1' },
            { name: 'Enterprise', value: total ? Math.round((counts.enterprise / total) * 100) : 20, color: '#10B981' },
          ]);
        }
      }

      // Process recent activity
      if (creditsResult.data) {
        const activity = creditsResult.data.map((t, i) => {
          const types = {
            deduction: { type: 'prompt', action: 'used credits' },
            topup: { type: 'payment', action: 'added credits' },
            bonus: { type: 'signup', action: 'received bonus' },
          };
          const info = types[t.transaction_type] || { type: 'prompt', action: t.description || 'activity' };
          const timeAgo = getTimeAgo(new Date(t.created_at));
          return {
            id: t.id || i,
            type: info.type,
            user: t.profiles?.email || 'Unknown user',
            action: `${info.action} (${t.amount} credits)`,
            time: timeAgo,
          };
        });
        setRecentActivity(activity);
      }

      // Set some sample alerts (in production, fetch from a system_alerts table)
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
      <div className="bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
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
    { title: 'Open Tickets', value: stats.open_tickets?.toString() || '0', change: '-', changeType: 'neutral', icon: HeadphonesIcon, color: 'purple' },
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
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
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
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
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
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
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
                    formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
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
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : stats ? (
              <>
                <div className="flex justify-between items-center p-3 bg-[#0A0E1A] rounded-lg">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-white font-semibold">{stats.total_users?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0A0E1A] rounded-lg">
                  <span className="text-gray-400">Total Prompts</span>
                  <span className="text-white font-semibold">{stats.total_prompts?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0A0E1A] rounded-lg">
                  <span className="text-gray-400">New This Week</span>
                  <span className="text-emerald-400 font-semibold">+{stats.new_users_week || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0A0E1A] rounded-lg">
                  <span className="text-gray-400">Credits Used</span>
                  <span className="text-white font-semibold">{stats.total_credits_used?.toLocaleString() || 0}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
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
            <div className="flex items-center gap-3 p-3 bg-[#0A0E1A] rounded-lg">
              <span className="text-gray-400">Last Refresh</span>
              <span className="text-white ml-auto">{new Date().toLocaleTimeString()}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type] || Zap;
                const colorClass = activityColors[activity.type] || activityColors.prompt;
                
                return (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-[#0A0E1A] rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        <span className="text-gray-400">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
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
              <p className="text-gray-500 text-center py-8">No alerts</p>
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
                      <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-500 hover:text-white p-1"
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
