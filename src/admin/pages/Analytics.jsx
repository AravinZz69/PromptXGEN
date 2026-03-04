import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  AlertCircle,
  Users,
  Coins,
  TrendingUp,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Badge from '../components/Badge';
import {
  mockChartData,
  mockCohortData,
  mockTopTemplates,
} from '../mockData';

// MOCK DATA - Analytics KPIs
const analyticsKPIs = [
  { title: 'Total API Calls', value: '2.4M', change: '+18%', changeType: 'positive', icon: Activity, color: 'blue' },
  { title: 'Avg Response Time', value: '342ms', change: '-12ms', changeType: 'positive', icon: Clock, color: 'green' },
  { title: 'Error Rate', value: '0.8%', change: '-0.2%', changeType: 'positive', icon: AlertCircle, color: 'emerald' },
  { title: 'Peak Concurrent', value: '1,247', change: '', changeType: 'positive', icon: Users, color: 'indigo' },
  { title: 'Token Usage', value: '847M', change: '', changeType: 'positive', icon: Coins, color: 'amber' },
  { title: '30-Day Retention', value: '68.4%', change: '+3.1%', changeType: 'positive', icon: TrendingUp, color: 'emerald' },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30 Days');
  const [planFilter, setPlanFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('Global');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real-time state
  const [activeUsers, setActiveUsers] = useState(1247);
  const [promptsPerMin, setPromptsPerMin] = useState(68);
  const [apiCallsPerMin, setApiCallsPerMin] = useState(152);
  const [sparklineData, setSparklineData] = useState(
    Array.from({ length: 10 }, (_, i) => ({ x: i, y: 140 + Math.random() * 40 }))
  );

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 11) - 5);
      setPromptsPerMin(Math.floor(58 + Math.random() * 17));
      setApiCallsPerMin(Math.floor(120 + Math.random() * 60));
      setSparklineData(prev => [
        ...prev.slice(1),
        { x: prev[prev.length - 1].x + 1, y: 140 + Math.random() * 40 }
      ]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    console.log('Exporting CSV...');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-white text-sm font-medium">
            {entry.name}: {typeof entry.value === 'number' ? 
              (entry.name.includes('%') || entry.name.includes('Rate') ? 
                `${entry.value.toFixed(1)}%` : 
                entry.value.toLocaleString()) : 
              entry.value}
          </p>
        ))}
      </div>
    );
  };

  const getRetentionColor = (value) => {
    if (value >= 70) return 'bg-emerald-500/20 text-emerald-400';
    if (value >= 40) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="sticky top-16 z-10 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Tabs */}
          <div className="flex bg-[#111827] rounded-lg p-1 border border-gray-800">
            {['Today', '7 Days', '30 Days', '90 Days', 'Custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Plans</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Global">Global</option>
            <option value="NA">North America</option>
            <option value="EU">Europe</option>
            <option value="APAC">Asia Pacific</option>
            <option value="Other">Other</option>
          </select>

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {analyticsKPIs.map((kpi, i) => (
          <StatCard key={i} {...kpi} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Funnel */}
        <ChartCard title="User Engagement Funnel">
          <div className="space-y-3">
            {mockChartData.funnelData.map((stage, i) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{stage.stage}</span>
                  <span className="text-sm text-white font-medium">
                    {stage.value.toLocaleString()}
                    {i > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({stage.conversion}%)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-8 bg-[#0A0E1A] rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-lg transition-all duration-500"
                    style={{ width: `${(stage.value / mockChartData.funnelData[0].value) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Token Consumption */}
        <ChartCard title="Token Consumption" subtitle="Last 30 Days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData.tokenConsumption}>
                <defs>
                  <linearGradient id="inputGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outputGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="inputTokens" stroke="#6366F1" fill="url(#inputGradient)" name="Input Tokens" />
                <Area type="monotone" dataKey="outputTokens" stroke="#10B981" fill="url(#outputGradient)" name="Output Tokens" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt Categories */}
        <ChartCard title="Prompt Categories">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData.promptCategories} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="percentage" fill="#6366F1" radius={[0, 4, 4, 0]} name="Usage %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Conversion Rates */}
        <ChartCard title="Subscription Conversion Rates" subtitle="Weekly">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData.conversionRates}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>} />
                <Line type="monotone" dataKey="freeToPro" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1' }} name="Free → Pro %" />
                <Line type="monotone" dataKey="proToEnterprise" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Pro → Enterprise %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <ChartCard title="Geographic Distribution">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Users</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">% Share</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Growth</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-32">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {mockChartData.topCountries.map((country, i) => (
                  <tr key={country.country} className="border-b border-gray-800/50">
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-white">{country.country}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{country.users.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{country.share}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${i % 2 === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {i % 2 === 0 ? '+' : '-'}{(Math.random() * 5 + 1).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${country.share}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Error Rate & Latency */}
        <ChartCard title="Error Rate & P95 Latency">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mockChartData.errorLatency}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => `${v}ms`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine yAxisId="left" y={2} stroke="#EF4444" strokeDasharray="3 3" />
                <Bar yAxisId="left" dataKey="errorRate" fill="#EF4444" radius={[2, 2, 0, 0]} name="Error Rate %" opacity={0.7} />
                <Line yAxisId="right" type="monotone" dataKey="p95Latency" stroke="#F59E0B" strokeWidth={2} dot={false} name="P95 Latency" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Cohort Retention Table */}
      <ChartCard title="User Cohort Retention">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cohort</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Users</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Day 1</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Day 7</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Day 14</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Day 30</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rev/User</th>
              </tr>
            </thead>
            <tbody>
              {mockCohortData.map((cohort) => (
                <tr key={cohort.cohort} className="border-b border-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white font-medium">{cohort.cohort}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{cohort.users.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.day1)}`}>
                      {cohort.day1}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.day7)}`}>
                      {cohort.day7}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.day14)}`}>
                      {cohort.day14}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.day30)}`}>
                      {cohort.day30}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-400">${cohort.revenuePerUser.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Top Templates Table */}
      <ChartCard title="Top Prompt Templates">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Template Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Times Used</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Avg Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {mockTopTemplates.map((template) => (
                <tr key={template.rank} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-gray-500">{template.rank}</td>
                  <td className="px-4 py-3 text-sm text-white">{template.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{template.timesUsed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-amber-400">★ {template.avgRating}</td>
                  <td className="px-4 py-3">
                    <Badge label={template.category} variant="purple" />
                  </td>
                  <td className="px-4 py-3">{getTrendIcon(template.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Real-Time Panel */}
      <ChartCard 
        title={
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span>Real-Time Metrics</span>
            <Badge label="LIVE" variant="success" />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Active Users */}
          <div className="bg-[#0A0E1A] rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Active Users Right Now</p>
            <p className="text-3xl font-bold text-white">{activeUsers.toLocaleString()}</p>
          </div>
          
          {/* Prompts/Min */}
          <div className="bg-[#0A0E1A] rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Prompts / Minute</p>
            <p className="text-3xl font-bold text-indigo-400">{promptsPerMin}</p>
          </div>
          
          {/* API Calls/Min */}
          <div className="bg-[#0A0E1A] rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">API Calls / Minute</p>
            <p className="text-3xl font-bold text-emerald-400">{apiCallsPerMin}</p>
          </div>
          
          {/* Mini Sparkline */}
          <div className="bg-[#0A0E1A] rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Activity (Last 30s)</p>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="y" 
                    stroke="#6366F1" 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
