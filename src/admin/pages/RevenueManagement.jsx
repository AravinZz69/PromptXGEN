import React, { useState, useEffect } from 'react';
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
  Loader2,
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
import { supabase } from '../../lib/supabase';
import { mockChartData } from '../mockData';

const statusVariants = {
  Active: 'success',
  Cancelled: 'danger',
  'Past Due': 'warning',
  Trialing: 'info',
  Expired: 'neutral',
};

export default function RevenueManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [failedPayments, setFailedPayments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals
  const [viewSubscription, setViewSubscription] = useState(null);
  const [createCouponOpen, setCreateCouponOpen] = useState(false);
  const [applyCreditOpen, setApplyCreditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // New coupon form
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expiry: '', maxUses: '' });

  // Fetch revenue data from Supabase
  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (!subsError && subsData) {
        const mappedSubs = subsData.map(s => ({
          id: s.id,
          user: s.profiles?.email || s.user_email || 'Unknown',
          userName: s.profiles?.full_name || 'Unknown',
          plan: s.plan || 'Free',
          status: s.status || 'Active',
          amount: s.amount || 0,
          startDate: s.start_date || s.created_at,
          nextBilling: s.next_billing_date || '-',
          paymentMethod: s.payment_method || 'card',
        }));
        setSubscriptions(mappedSubs);
      }

      // Fetch credit transactions for revenue data
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('type', 'purchase')
        .order('created_at', { ascending: false });

      // Calculate KPIs
      const totalRevenue = (transactions || []).reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);
      const proUsers = (subsData || []).filter(s => s.plan === 'Pro' || s.plan === 'pro').length;
      const enterpriseUsers = (subsData || []).filter(s => s.plan === 'Enterprise' || s.plan === 'enterprise').length;
      
      const mrr = proUsers * 19 + enterpriseUsers * 99;
      const arr = mrr * 12;
      const arpu = (subsData?.length || 1) > 0 ? mrr / (subsData?.length || 1) : 0;

      setKpis([
        { title: 'MRR', value: `$${mrr.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
        { title: 'ARR', value: `$${arr.toLocaleString()}`, icon: TrendingUp, color: 'green' },
        { title: 'ARPU', value: `$${arpu.toFixed(2)}`, icon: Users, color: 'blue' },
        { title: 'Pro Users', value: proUsers.toString(), changeType: 'positive', icon: TrendingUp, color: 'indigo' },
        { title: 'Enterprise', value: enterpriseUsers.toString(), changeType: 'positive', icon: CreditCard, color: 'purple' },
        { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, changeType: 'positive', icon: DollarSign, color: 'emerald' },
      ]);

      // Generate chart data from transactions
      const dayMap = {};
      (transactions || []).forEach(t => {
        const day = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap[day] = (dayMap[day] || 0) + Math.abs(t.amount || 0);
      });

      const chartDataMapped = Object.entries(dayMap)
        .slice(-14)
        .map(([name, Revenue]) => ({ name, Revenue }));

      setChartData(chartDataMapped.length > 0 ? chartDataMapped : [
        { name: 'No Data', Revenue: 0 }
      ]);

      // Set empty arrays for tables that need the admin_tables migration
      setFailedPayments([]);
      setCoupons([]);

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const pageSize = 10;
  const totalPages = Math.ceil(subscriptions.length / pageSize);
  const paginatedSubs = subscriptions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-white text-sm font-medium">
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  const handleRetryPayment = async (payment) => {
    console.log('Retrying payment for:', payment.user);
    alert(`Retrying payment for ${payment.user}`);
  };

  const handleCreateCoupon = async () => {
    // For now, just add to local state - full implementation requires coupons table
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

  const handleRefund = async (sub) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'Cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      if (error) throw error;

      setSubscriptions(subscriptions.map(s => 
        s.id === sub.id ? { ...s, status: 'Cancelled' } : s
      ));
      setConfirmAction(null);
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const handleCancel = async (sub) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'Cancelled',
          next_billing_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      if (error) throw error;

      setSubscriptions(subscriptions.map(s => 
        s.id === sub.id ? { ...s, status: 'Cancelled', nextBilling: '-' } : s
      ));
      setConfirmAction(null);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Revenue Management</h2>
        <button
          onClick={fetchRevenueData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <StatCard key={i} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Over Time */}
        <ChartCard title="Revenue Over Time" subtitle="Last 14 Days">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
        <ChartCard title={<span>Revenue by Plan <span className="text-xs text-amber-500 ml-2">(Sample Data)</span></span>}>
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
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-white">Active Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Started</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Next Billing</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubs.map(sub => (
                <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-white">{sub.user}</td>
                  <td className="px-4 py-3">
                    <Badge label={sub.plan} variant={sub.plan === 'Enterprise' ? 'success' : 'purple'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-400">${sub.amount}</td>
                  <td className="px-4 py-3">
                    <Badge label={sub.status} variant={statusVariants[sub.status]} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(sub.started).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{sub.nextBilling}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewSubscription(sub)}
                        className="text-muted-foreground hover:text-white"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Applying coupon for ${sub.user}`)}
                        className="text-muted-foreground hover:text-primary"
                        title="Apply Coupon"
                      >
                        <Percent className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'refund', sub })}
                        className="text-muted-foreground hover:text-amber-400"
                        title="Refund"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'cancel', sub })}
                        className="text-muted-foreground hover:text-red-400"
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
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Failed Payments */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-white">Failed Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Attempts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Last Try</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {failedPayments.map(payment => (
                <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-white">{payment.user}</td>
                  <td className="px-4 py-3 text-sm text-red-400">${payment.amount}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{payment.reason}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{payment.attempts}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(payment.lastTry).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRetryPayment(payment)}
                        className="px-3 py-1 bg-primary/20 text-primary rounded text-sm hover:bg-primary/90/30"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => alert(`Contacting ${payment.user}`)}
                        className="p-1 text-muted-foreground hover:text-white"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="px-2 py-1 text-xs text-muted-foreground hover:text-muted-foreground">
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
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Coupons & Credits</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setApplyCreditOpen(true)}
              className="px-3 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted"
            >
              Apply Credit
            </button>
            <button
              onClick={() => setCreateCouponOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary"
            >
              <Plus className="w-4 h-4" />
              Create Coupon
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Uses</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-border/50">
                  <td className="px-4 py-3 text-sm text-white font-mono">{coupon.code}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400">{coupon.discount}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{coupon.uses} / {coupon.maxUses}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{coupon.expiry}</td>
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
            <label className="block text-sm text-muted-foreground mb-2">Coupon Code</label>
            <input
              type="text"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SUMMER25"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Discount</label>
            <input
              type="text"
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
              placeholder="e.g., 25%"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Expiry Date</label>
            <input
              type="date"
              value={newCoupon.expiry}
              onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Max Uses</label>
            <input
              type="number"
              value={newCoupon.maxUses}
              onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
              placeholder="e.g., 100"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCreateCouponOpen(false)}
              className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCoupon}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary"
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
            <label className="block text-sm text-muted-foreground mb-2">User Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Credit Amount ($)</label>
            <input
              type="number"
              placeholder="e.g., 50"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Reason</label>
            <textarea
              rows={3}
              placeholder="Reason for credit..."
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setApplyCreditOpen(false)}
              className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => { console.log('Credit applied'); setApplyCreditOpen(false); }}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary"
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
                <p className="text-xs text-muted-foreground uppercase">User</p>
                <p className="text-white">{viewSubscription.user}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Plan</p>
                <Badge label={viewSubscription.plan} variant="purple" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Amount</p>
                <p className="text-emerald-400">${viewSubscription.amount}/mo</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Status</p>
                <Badge label={viewSubscription.status} variant={statusVariants[viewSubscription.status]} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Started</p>
                <p className="text-muted-foreground">{new Date(viewSubscription.started).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Next Billing</p>
                <p className="text-muted-foreground">{viewSubscription.nextBilling}</p>
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
