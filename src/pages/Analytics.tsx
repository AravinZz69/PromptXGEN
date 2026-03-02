import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Zap,
  Wand2,
  Download,
  ChevronDown,
  LayoutTemplate,
  MessageSquare,
  Coins
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for the line chart - Prompt Generation Activity
const generationActivityData = [
  { month: 'Jan', prompts: 45, templates: 32 },
  { month: 'Feb', prompts: 52, templates: 28 },
  { month: 'Mar', prompts: 78, templates: 45 },
  { month: 'Apr', prompts: 65, templates: 38 },
  { month: 'May', prompts: 89, templates: 52 },
  { month: 'Jun', prompts: 72, templates: 41 },
  { month: 'Jul', prompts: 95, templates: 58 },
  { month: 'Aug', prompts: 142, templates: 87 },
  { month: 'Sep', prompts: 68, templates: 42 },
  { month: 'Oct', prompts: 85, templates: 51 },
  { month: 'Nov', prompts: 110, templates: 68 },
  { month: 'Dec', prompts: 98, templates: 62 },
];

// Sample data for the bar chart - Usage by Category
const usageByCategoryData = [
  { category: 'Writing', prompts: 156, ai: 89 },
  { category: 'Coding', prompts: 134, ai: 112 },
  { category: 'Learning', prompts: 98, ai: 67 },
  { category: 'JEE/NEET', prompts: 87, ai: 45 },
  { category: 'UPSC', prompts: 65, ai: 34 },
  { category: 'Creative', prompts: 78, ai: 56 },
];

// Custom tooltip types
interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Custom tooltip for line chart
const CustomLineTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2a2a3e] border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold text-lg">{payload[0]?.value} generations</p>
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2a2a3e] border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-400">{entry.value}</span>
            <span className="text-gray-500">
              {entry.dataKey === 'prompts' ? 'Prompt Generator' : 'AI Chat'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Circular Progress Component
const CircularProgress = ({ 
  percentage, 
  label, 
  value, 
  color = '#f97316',
  size = 80 
}: { 
  percentage: number; 
  label: string; 
  value?: string;
  color?: string;
  size?: number;
}) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2a2a3e"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{percentage}%</span>
        </div>
      </div>
      <div>
        {value && <p className="text-white font-semibold">{value}</p>}
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  comparison, 
  icon: Icon,
  isPositive = true 
}: { 
  title: string; 
  value: string; 
  change: string; 
  comparison: string;
  icon: React.ElementType;
  isPositive?: boolean;
}) => (
  <motion.div 
    className="bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-gray-400 text-sm font-medium">{title}</span>
      <Icon className="w-5 h-5 text-gray-500" />
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </span>
    </div>
    <p className="text-gray-500 text-xs mt-2">{comparison}</p>
  </motion.div>
);

const Analytics = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All Activity');

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex">
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
          else if (id === 'analytics') navigate('/analytics');
        }}
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content */}
      <div className="flex-1 ml-[70px]">
        <MiniNavbar />

        <motion.div 
          className="p-6 pt-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                    Show: {selectedFilter}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1e1e2f] border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => setSelectedFilter('All Activity')}
                    className="text-gray-300 focus:bg-gray-700"
                  >
                    All Activity
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSelectedFilter('Prompt Generator')}
                    className="text-gray-300 focus:bg-gray-700"
                  >
                    Prompt Generator
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSelectedFilter('AI Chat')}
                    className="text-gray-300 focus:bg-gray-700"
                  >
                    AI Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSelectedFilter('Templates')}
                    className="text-gray-300 focus:bg-gray-700"
                  >
                    Templates
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Prompts Generated" 
              value="1,247" 
              change="+12.5%" 
              comparison="Compared to 1,108 last month"
              icon={Wand2}
              isPositive={true}
            />
            <StatCard 
              title="Templates Used" 
              value="384" 
              change="+8.2%" 
              comparison="Compared to 355 last month"
              icon={LayoutTemplate}
              isPositive={true}
            />
            <StatCard 
              title="AI Conversations" 
              value="562" 
              change="+18.7%" 
              comparison="Compared to 473 last month"
              icon={MessageSquare}
              isPositive={true}
            />
            <StatCard 
              title="Credits Used" 
              value="2,850" 
              change="-5.3%" 
              comparison="Efficient usage this month"
              icon={Coins}
              isPositive={true}
            />
          </div>

          {/* Generation Activity Chart + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Line Chart */}
            <motion.div 
              className="lg:col-span-3 bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Generation Activity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-gray-400 text-sm">Prompts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="text-gray-400 text-sm">Templates</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generationActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#2a2a3e' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#2a2a3e' }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="prompts" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#f97316' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="templates" 
                      stroke="#14b8a6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#14b8a6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Side Stats */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Success Rate */}
              <div className="bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90" width={64} height={64}>
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        stroke="#2a2a3e"
                        strokeWidth={6}
                        fill="none"
                      />
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        stroke="#f97316"
                        strokeWidth={6}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={163.36}
                        strokeDashoffset={163.36 * 0.08}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">92%</p>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>

              {/* Prompt Quality */}
              <div className="bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90" width={64} height={64}>
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        stroke="#2a2a3e"
                        strokeWidth={6}
                        fill="none"
                      />
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        stroke="#14b8a6"
                        strokeWidth={6}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={163.36}
                        strokeDashoffset={163.36 * 0.15}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-teal-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">85%</p>
                    <p className="text-gray-400 text-sm">Quality Score</p>
                  </div>
                </div>
              </div>

              {/* Total Generations */}
              <div className="bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90" width={64} height={64}>
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        stroke="#2a2a3e"
                        strokeWidth={6}
                        fill="none"
                      />
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        stroke="#8b5cf6"
                        strokeWidth={6}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={163.36}
                        strokeDashoffset={163.36 * 0.28}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">2,193</p>
                    <p className="text-gray-400 text-sm">Total Generations</p>
                    <p className="text-emerald-400 text-xs flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> 14.2%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Usage Distribution */}
            <motion.div 
              className="bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4">
                <h3 className="text-white font-semibold">Usage Distribution</h3>
                <p className="text-gray-500 text-sm">By feature type</p>
              </div>
              <div className="flex flex-wrap items-center justify-around gap-4">
                <CircularProgress 
                  percentage={58} 
                  label="Prompt Generator" 
                  value="1,247"
                  color="#f97316"
                  size={70}
                />
                <CircularProgress 
                  percentage={26} 
                  label="AI Chat" 
                  value="562"
                  color="#14b8a6"
                  size={70}
                />
                <CircularProgress 
                  percentage={16} 
                  label="Templates" 
                  value="384"
                  color="#8b5cf6"
                  size={70}
                />
              </div>
            </motion.div>

            {/* Usage by Category Bar Chart */}
            <motion.div 
              className="bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">Usage by Category</h3>
                  <p className="text-gray-500 text-sm">Prompt types breakdown</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-gray-400 text-sm">Prompts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="text-gray-400 text-sm">AI Chat</span>
                  </div>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageByCategoryData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                    <XAxis 
                      dataKey="category" 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      axisLine={{ stroke: '#2a2a3e' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      axisLine={{ stroke: '#2a2a3e' }}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="prompts" fill="#f97316" radius={[2, 2, 0, 0]} barSize={16} />
                    <Bar dataKey="ai" fill="#14b8a6" radius={[2, 2, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Section */}
          <motion.div 
            className="mt-6 bg-[#1e1e2f] rounded-xl p-5 border border-gray-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-white font-semibold mb-4">Top Performing Categories</h3>
            <div className="space-y-3">
              {[
                { name: 'Essay Writing', count: 342, percentage: 85, color: '#f97316' },
                { name: 'Code Generation', count: 287, percentage: 72, color: '#14b8a6' },
                { name: 'Study Notes', count: 198, percentage: 58, color: '#8b5cf6' },
                { name: 'JEE Problems', count: 156, percentage: 45, color: '#ec4899' },
                { name: 'Creative Writing', count: 134, percentage: 38, color: '#06b6d4' },
              ].map((category, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-gray-300 text-sm">{category.name}</div>
                  <div className="flex-1 bg-[#2a2a3e] rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: category.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <div className="w-16 text-right text-gray-400 text-sm">{category.count}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
