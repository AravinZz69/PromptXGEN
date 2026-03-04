import React, { useState } from 'react';
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
import {
  mockChartData,
  mockRevenueData,
  mockActivityFeed,
  mockSystemAlerts,
} from '../mockData';

// MOCK DATA - Dashboard KPIs
const kpiData = [
  { title: 'Total Users', value: '12,480', change: '+8.2%', changeType: 'positive', icon: Users, color: 'blue' },
  { title: 'Active Subscriptions', value: '3,241', change: '+12.5%', changeType: 'positive', icon: CreditCard, color: 'green' },
  { title: 'Prompts Today', value: '87,432', change: '+34.1%', changeType: 'positive', icon: MessageSquare, color: 'indigo' },
  { title: 'MRR', value: '$48,290', change: '+6.8%', changeType: 'positive', icon: DollarSign, color: 'emerald' },
  { title: 'Churn Rate', value: '2.3%', change: '-0.4%', changeType: 'negative', icon: TrendingDown, color: 'red' },
  { title: 'Avg Session', value: '14m 32s', change: '+1m 2s', changeType: 'positive', icon: Clock, color: 'amber' },
];

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

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState(mockSystemAlerts);

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

  return (
    <div className="space-y-6">
      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, i) => (
          <StatCard key={i} {...kpi} />
        ))}
      </div>

      {/* Row 2 - Charts (2 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt Generation - Last 30 Days */}
        <ChartCard title="Prompt Generation" subtitle="Last 30 Days">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData.promptsDaily}>
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
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
          </div>
        </ChartCard>

        {/* New Signups Per Week */}
        <ChartCard title="New Signups Per Week" subtitle="Last 8 Weeks">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData.signupsWeekly}>
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
          </div>
        </ChartCard>
      </div>

      {/* Row 3 - Charts (3 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Tier Breakdown */}
        <ChartCard title="Subscription Tier Breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockChartData.subscriptionBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {mockChartData.subscriptionBreakdown.map((entry, index) => (
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
          </div>
        </ChartCard>

        {/* Revenue by Month */}
        <ChartCard title="Revenue by Month" subtitle="MRR vs Target">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData.slice(-6)}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickFormatter={(v) => v.split(' ')[0]}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mrr" fill="#6366F1" radius={[4, 4, 0, 0]} name="MRR" />
                <Bar dataKey="target" fill="#374151" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top Countries */}
        <ChartCard title="Top Countries by Users">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={mockChartData.topCountries} 
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="country" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="users" fill="#10B981" radius={[0, 4, 4, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 4 - Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <ChartCard title="Recent Activity Feed">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {mockActivityFeed.map((activity) => {
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
            })}
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
