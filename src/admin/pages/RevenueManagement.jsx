import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  RefreshCw,
  Mail,
  XCircle,
  Plus,
  Eye,
  Percent,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  mockRevenueData,
  mockTransactions,
  mockFailedPayments,
  mockCoupons,
  mockChartData,
} from '../mockData';

const statusVariants = {
  Active: 'success',
  Cancelled: 'danger',
  'Past Due': 'warning',
  Trialing: 'info',
  Expired: 'neutral',
};

export default function RevenueManagement() {
  const [subscriptions, setSubscriptions] = useState(mockTransactions);
  const [failedPayments] = useState(mockFailedPayments);
  const [coupons, setCoupons] = useState(mockCoupons);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals
  const [viewSubscription, setViewSubscription] = useState(null);
  const [createCouponOpen, setCreateCouponOpen] = useState(false);
  const [applyCreditOpen, setApplyCreditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // New coupon form
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expiry: '', maxUses: '' });

  const pageSize = 10;
  const totalPages = Math.ceil(subscriptions.length / pageSize);
  const paginatedSubs = subscriptions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // MOCK DATA - KPIs
  const kpis = [
    { title: 'MRR', value: '$48,290', icon: DollarSign, color: 'emerald' },
    { title: 'ARR', value: '$579,480', icon: TrendingUp, color: 'green' },
    { title: 'ARPU', value: '$14.90', icon: Users, color: 'blue' },
    { title: 'New MRR', value: '$6,200', change: '+12%', changeType: 'positive', icon: TrendingUp, color: 'indigo' },
    { title: 'Churned MRR', value: '$1,100', change: '-$200', changeType: 'negative', icon: TrendingDown, color: 'red' },
    { title: 'Net MRR Growth', value: '+$5,100', change: '+8.5%', changeType: 'positive', icon: CreditCard, color: 'emerald' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-white text-sm font-medium">
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  const handleRetryPayment = (payment) => {
    console.log('Retrying payment for:', payment.user);
    alert(`Retrying payment for ${payment.user}`);
  };

  const handleCreateCoupon = () => {
    const coupon = {
      id: coupons.length + 1,
      ...newCoupon,
      uses: 0,
      status: 'Active',
    };
    setCoupons([coupon, ...coupons]);
    setNewCoupon({ code: '', discount: '', expiry: '', maxUses: '' });
    setCreateCouponOpen(false);
  };

  const handleRefund = (sub) => {
    console.log('Processing refund for:', sub.user);
    setSubscriptions(subscriptions.map(s => 
      s.id === sub.id ? { ...s, status: 'Cancelled' } : s
    ));
    setConfirmAction(null);
  };

  const handleCancel = (sub) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === sub.id ? { ...s, status: 'Cancelled', nextBilling: '-' } : s
    ));
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <StatCard key={i} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Over Time */}
        <ChartCard title="MRR Over Time" subtitle="Last 12 Months">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#mrrGradient)"
                  name="MRR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Revenue by Plan */}
        <ChartCard title="Revenue by Plan">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData.revenueByPlan}>
                <XAxis 
                  dataKey="plan" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Active Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Started</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Next Billing</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubs.map(sub => (
                <tr key={sub.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-white">{sub.user}</td>
                  <td className="px-4 py-3">
                    <Badge label={sub.plan} variant={sub.plan === 'Enterprise' ? 'success' : 'purple'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-400">${sub.amount}</td>
                  <td className="px-4 py-3">
                    <Badge label={sub.status} variant={statusVariants[sub.status]} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(sub.started).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{sub.nextBilling}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewSubscription(sub)}
                        className="text-gray-400 hover:text-white"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Applying coupon for ${sub.user}`)}
                        className="text-gray-400 hover:text-indigo-400"
                        title="Apply Coupon"
                      >
                        <Percent className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'refund', sub })}
                        className="text-gray-400 hover:text-amber-400"
                        title="Refund"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'cancel', sub })}
                        className="text-gray-400 hover:text-red-400"
                        title="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Failed Payments */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Failed Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Attempts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Last Try</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {failedPayments.map(payment => (
                <tr key={payment.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-white">{payment.user}</td>
                  <td className="px-4 py-3 text-sm text-red-400">${payment.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{payment.reason}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{payment.attempts}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(payment.lastTry).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRetryPayment(payment)}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded text-sm hover:bg-indigo-500/30"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => alert(`Contacting ${payment.user}`)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300">
                        Write Off
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupons & Credits */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Coupons & Credits</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setApplyCreditOpen(true)}
              className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
            >
              Apply Credit
            </button>
            <button
              onClick={() => setCreateCouponOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4" />
              Create Coupon
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Uses</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white font-mono">{coupon.code}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400">{coupon.discount}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{coupon.uses} / {coupon.maxUses}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{coupon.expiry}</td>
                  <td className="px-4 py-3">
                    <Badge 
                      label={coupon.status} 
                      variant={coupon.status === 'Active' ? 'success' : 'neutral'} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={createCouponOpen} onClose={() => setCreateCouponOpen(false)} title="Create Coupon">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Coupon Code</label>
            <input
              type="text"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SUMMER25"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Discount</label>
            <input
              type="text"
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
              placeholder="e.g., 25%"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
            <input
              type="date"
              value={newCoupon.expiry}
              onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Uses</label>
            <input
              type="number"
              value={newCoupon.maxUses}
              onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
              placeholder="e.g., 100"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCreateCouponOpen(false)}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCoupon}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Create Coupon
            </button>
          </div>
        </div>
      </Modal>

      {/* Apply Credit Modal */}
      <Modal isOpen={applyCreditOpen} onClose={() => setApplyCreditOpen(false)} title="Apply Credit">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">User Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Credit Amount ($)</label>
            <input
              type="number"
              placeholder="e.g., 50"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Reason</label>
            <textarea
              rows={3}
              placeholder="Reason for credit..."
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setApplyCreditOpen(false)}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => { console.log('Credit applied'); setApplyCreditOpen(false); }}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Apply Credit
            </button>
          </div>
        </div>
      </Modal>

      {/* View Subscription Modal */}
      <Modal isOpen={!!viewSubscription} onClose={() => setViewSubscription(null)} title="Subscription Details">
        {viewSubscription && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">User</p>
                <p className="text-white">{viewSubscription.user}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Plan</p>
                <Badge label={viewSubscription.plan} variant="purple" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Amount</p>
                <p className="text-emerald-400">${viewSubscription.amount}/mo</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <Badge label={viewSubscription.status} variant={statusVariants[viewSubscription.status]} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Started</p>
                <p className="text-gray-300">{new Date(viewSubscription.started).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Next Billing</p>
                <p className="text-gray-300">{viewSubscription.nextBilling}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmAction?.type === 'refund'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleRefund(confirmAction.sub)}
        title="Process Refund"
        message={`Are you sure you want to refund $${confirmAction?.sub?.amount} to ${confirmAction?.sub?.user}?`}
        confirmLabel="Process Refund"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={confirmAction?.type === 'cancel'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleCancel(confirmAction.sub)}
        title="Cancel Subscription"
        message={`Are you sure you want to cancel ${confirmAction?.sub?.user}'s subscription?`}
        confirmLabel="Cancel Subscription"
        variant="danger"
      />
    </div>
  );
}
