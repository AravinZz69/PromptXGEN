import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Receipt, CreditCard, Search, Download, ArrowUpRight, ArrowDownRight,
  Loader2, Filter, Calendar, Zap, Crown, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, RefreshCw,
} from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface PaymentTransaction {
  id: string;
  user_id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string;
  plan_name: string;
  credits_purchased: number;
  metadata: any;
  created_at: string;
}

const ITEMS_PER_PAGE = 15;

const TransactionHistory = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'payments' | 'credits'>('payments');
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [credits, setCreditTxs] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const loadPayments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('payment_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (searchQuery) query = query.or(`plan_name.ilike.%${searchQuery}%,gateway.ilike.%${searchQuery}%,transaction_id.ilike.%${searchQuery}%`);

      const from = (page - 1) * ITEMS_PER_PAGE;
      query = query.range(from, from + ITEMS_PER_PAGE - 1);

      const { data, count, error } = await query;
      if (error) throw error;
      setPayments(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, page, statusFilter, searchQuery]);

  const loadCredits = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('credit_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchQuery) query = query.ilike('description', `%${searchQuery}%`);

      const from = (page - 1) * ITEMS_PER_PAGE;
      query = query.range(from, from + ITEMS_PER_PAGE - 1);

      const { data, count, error } = await query;
      if (error) throw error;
      setCreditTxs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error loading credit transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, page, searchQuery]);

  useEffect(() => {
    if (activeTab === 'payments') loadPayments();
    else loadCredits();
  }, [activeTab, loadPayments, loadCredits]);

  useEffect(() => { setPage(1); }, [activeTab, statusFilter, searchQuery]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getCreditIcon = (type: string) => {
    switch (type) {
      case 'topup': return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'deduction': case 'usage': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'reset': return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default: return <Zap className="h-4 w-4 text-primary" />;
    }
  };

  const exportCSV = () => {
    const rows = activeTab === 'payments'
      ? payments.map(p => ({
          Date: new Date(p.created_at).toLocaleDateString(),
          Plan: p.plan_name,
          Amount: p.amount,
          Currency: p.currency,
          Gateway: p.gateway,
          Status: p.status,
          TransactionID: p.transaction_id,
          Credits: p.credits_purchased,
        }))
      : credits.map(c => ({
          Date: new Date(c.created_at).toLocaleDateString(),
          Type: c.transaction_type,
          Amount: c.amount,
          Description: c.description,
        }));

    const headers = Object.keys(rows[0] || {}).join(',');
    const csv = [headers, ...rows.map(r => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userName={userName}
        userRole="User"
        userInitials={userInitials}
        onNavigate={(id) => {
          const routes: Record<string, string> = {
            dashboard: '/dashboard', generate: '/generate', 'generative-ai': '/generative-ai',
            templates: '/templates', history: '/history', analytics: '/analytics',
            settings: '/settings', upgrade: '/upgrade',
          };
          if (routes[id]) navigate(routes[id]);
        }}
        onLogout={() => { signOut(); navigate('/'); }}
      />

      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />
        <main className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Receipt className="h-7 w-7 text-primary" />
                  Transaction History
                </h1>
                <p className="text-muted-foreground mt-1">View all your payments and credit transactions</p>
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={isLoading || totalCount === 0} className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mb-6">
              {(['payments', 'credits'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'payments' ? (
                    <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payments</span>
                  ) : (
                    <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Credits</span>
                  )}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === 'payments' ? 'Search by plan, gateway, or ID...' : 'Search by description...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {activeTab === 'payments' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : totalCount === 0 ? (
              <div className="text-center py-20 space-y-3">
                <Receipt className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground">No transactions found</p>
                {activeTab === 'payments' && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/upgrade')} className="gap-2">
                    <Crown className="h-4 w-4" /> View Plans
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Transaction list */}
                <div className="space-y-2">
                  {activeTab === 'payments'
                    ? payments.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${
                              tx.status === 'success' ? 'bg-green-500/10' : tx.status === 'failed' ? 'bg-red-500/10' : 'bg-amber-500/10'
                            }`}>
                              {getStatusIcon(tx.status)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {tx.plan_name} Plan
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-medium">
                                  {tx.gateway}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${
                                  tx.status === 'success' ? 'bg-green-500/10 text-green-500' :
                                  tx.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                                  'bg-amber-500/10 text-amber-500'
                                }`}>
                                  {tx.status}
                                </span>
                                {tx.metadata?.is_test_mode && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">🧪 Test</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">₹{tx.amount}</p>
                            <p className="text-xs text-muted-foreground">
                              +{tx.credits_purchased === 9999 ? '∞' : tx.credits_purchased} credits
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5 truncate max-w-[120px]">
                              {tx.transaction_id}
                            </p>
                          </div>
                        </div>
                      ))
                    : credits.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${
                              tx.transaction_type === 'topup' ? 'bg-green-500/10' :
                              tx.transaction_type === 'reset' ? 'bg-amber-500/10' : 'bg-red-500/10'
                            }`}>
                              {getCreditIcon(tx.transaction_type)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{tx.description || tx.transaction_type}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${
                              tx.transaction_type === 'topup' ? 'text-green-500' :
                              tx.transaction_type === 'reset' ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {tx.transaction_type === 'topup' ? '+' : tx.transaction_type === 'deduction' || tx.transaction_type === 'usage' ? '-' : ''}
                              {tx.amount} credits
                            </p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-medium">
                              {tx.transaction_type}
                            </span>
                          </div>
                        </div>
                      ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} · {totalCount} total
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline" size="sm" disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline" size="sm" disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default TransactionHistory;
