/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Payment Gateway Manager - Admin Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Configure payment gateways (Razorpay, PayPal, Stripe)
 * - Enable/disable gateways
 * - Test mode toggle
 * - API key configuration
 * - Integration code snippets
 * - Transaction history & refunds
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Eye,
  EyeOff,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  CreditCard,
  Settings,
  Code,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentGateway {
  id: string;
  name: string;
  display_name: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  config: GatewayConfig;
  created_at: string;
  updated_at: string;
}

interface GatewayConfig {
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  client_id?: string;
  client_secret?: string;
  key_id?: string;
  key_secret?: string;
  [key: string]: string | undefined;
}

interface Transaction {
  id: string;
  user_id: string;
  user_email: string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transaction_id: string;
  plan_name: string;
  credits_purchased: number;
  metadata: any;
  created_at: string;
}

const ITEMS_PER_PAGE = 15;

// Gateway configurations
const GATEWAY_CONFIGS: Record<string, { fields: { key: string; label: string; secret?: boolean }[] }> = {
  razorpay: {
    fields: [
      { key: 'key_id', label: 'Key ID' },
      { key: 'key_secret', label: 'Key Secret', secret: true },
      { key: 'webhook_secret', label: 'Webhook Secret', secret: true },
    ],
  },
  paypal: {
    fields: [
      { key: 'client_id', label: 'Client ID' },
      { key: 'client_secret', label: 'Client Secret', secret: true },
      { key: 'webhook_id', label: 'Webhook ID' },
    ],
  },
  stripe: {
    fields: [
      { key: 'api_key', label: 'Publishable Key' },
      { key: 'api_secret', label: 'Secret Key', secret: true },
      { key: 'webhook_secret', label: 'Webhook Secret', secret: true },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentGateway() {
  const [activeTab, setActiveTab] = useState<'gateways' | 'transactions'>('gateways');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Gateway</h1>
        <p className="text-gray-400 text-sm">
          Configure payment providers and view transactions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="gateways"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2"
          >
            <Settings className="w-4 h-4" />
            Gateway Config
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="mt-6">
          <GatewayConfigTab />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GATEWAY CONFIG TAB
// ─────────────────────────────────────────────────────────────────────────────

function GatewayConfigTab() {
  const { toast } = useToast();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('name');

      if (error) throw error;

      // If no gateways exist, create default ones
      if (!data || data.length === 0) {
        const defaults = [
          { name: 'razorpay', display_name: 'Razorpay', config: {} },
          { name: 'paypal', display_name: 'PayPal', config: {} },
          { name: 'stripe', display_name: 'Stripe', config: {} },
        ];
        const { data: inserted, error: insertError } = await supabase
          .from('payment_gateways')
          .insert(defaults)
          .select();
        if (insertError) throw insertError;
        setGateways(inserted || []);
      } else {
        setGateways(data);
      }
    } catch (error: any) {
      toast({
        title: '❌ Error loading gateways',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGateway = async (id: string, updates: Partial<PaymentGateway>) => {
    try {
      setSaving(id);
      const { error } = await supabase
        .from('payment_gateways')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setGateways((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
      toast({ title: '✅ Gateway updated' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gateway Cards */}
      <div className="grid gap-6">
        {gateways.map((gateway) => (
          <GatewayCard
            key={gateway.id}
            gateway={gateway}
            saving={saving === gateway.id}
            onUpdate={(updates) => updateGateway(gateway.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GATEWAY CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function GatewayCard({
  gateway,
  saving,
  onUpdate,
}: {
  gateway: PaymentGateway;
  saving: boolean;
  onUpdate: (updates: Partial<PaymentGateway>) => void;
}) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<GatewayConfig>(gateway.config || {});
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const configFields = GATEWAY_CONFIGS[gateway.name]?.fields || [];

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate({ config });
  };

  const getIntegrationCode = () => {
    switch (gateway.name) {
      case 'razorpay':
        return `// Razorpay Integration
const options = {
  key: "${config.key_id || 'YOUR_KEY_ID'}",
  amount: amount * 100, // Amount in paise
  currency: "INR",
  name: "PromptXGEN",
  description: "Credits Purchase",
  handler: function (response) {
    // Handle success
    console.log(response.razorpay_payment_id);
  },
  prefill: {
    email: user.email,
  },
  theme: {
    color: "#4F46E5"
  }
};
const razorpay = new Razorpay(options);
razorpay.open();`;

      case 'paypal':
        return `// PayPal Integration
paypal.Buttons({
  createOrder: (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '${config.amount || '9.99'}'
        }
      }]
    });
  },
  onApprove: (data, actions) => {
    return actions.order.capture().then((details) => {
      // Handle success
      console.log('Transaction completed by ' + details.payer.name.given_name);
    });
  }
}).render('#paypal-button-container');`;

      case 'stripe':
        return `// Stripe Integration
const stripe = Stripe('${config.api_key || 'YOUR_PUBLISHABLE_KEY'}');
const { error } = await stripe.redirectToCheckout({
  lineItems: [{
    price: priceId,
    quantity: 1,
  }],
  mode: 'payment',
  successUrl: window.location.origin + '/success',
  cancelUrl: window.location.origin + '/cancel',
});
if (error) {
  console.error(error);
}`;

      default:
        return '// Integration code not available';
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getIntegrationCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gatewayIcons: Record<string, string> = {
    razorpay: '💳',
    paypal: '🅿️',
    stripe: '💰',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{gatewayIcons[gateway.name] || '💳'}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">{gateway.display_name}</h3>
            <p className="text-xs text-gray-500">
              Last updated: {gateway.updated_at ? formatDistanceToNow(new Date(gateway.updated_at), { addSuffix: true }) : 'Never'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Test Mode */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Test Mode</span>
            <Switch
              checked={gateway.is_test_mode}
              onCheckedChange={(checked) => onUpdate({ is_test_mode: checked })}
              className="data-[state=checked]:bg-yellow-600"
            />
          </div>
          {/* Enable/Disable */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Enabled</span>
            <Switch
              checked={gateway.is_enabled}
              onCheckedChange={(checked) => onUpdate({ is_enabled: checked })}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Test Mode Warning */}
        {gateway.is_test_mode && gateway.is_enabled && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-400">
              Test mode is enabled. Transactions will not be real.
            </span>
          </div>
        )}

        {/* Config Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {configFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                  value={config[field.key] || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg"
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() => toggleSecret(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets[field.key] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => setShowCode(!showCode)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-2"
          >
            <Code className="w-4 h-4" />
            {showCode ? 'Hide' : 'Show'} Integration Code
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Configuration
          </Button>
        </div>

        {/* Integration Code */}
        {showCode && (
          <div className="relative">
            <pre className="p-4 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 overflow-x-auto">
              <code>{getIntegrationCode()}</code>
            </pre>
            <button
              onClick={copyCode}
              className="absolute top-2 right-2 p-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS TAB
// ─────────────────────────────────────────────────────────────────────────────

function TransactionsTab() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [refundItem, setRefundItem] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: '❌ Error loading transactions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const successful = transactions.filter((t) => t.status === 'success');
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    return {
      total: successful.reduce((sum, t) => sum + (t.amount || 0), 0),
      thisMonth: successful
        .filter((t) => new Date(t.created_at) >= thisMonth)
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      successful: successful.length,
      failed: transactions.filter((t) => t.status === 'failed').length,
    };
  }, [transactions]);

  // Filtering
  const filteredItems = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.user_email?.toLowerCase().includes(q) ||
          t.transaction_id?.toLowerCase().includes(q)
      );
    }

    if (gatewayFilter !== 'all') {
      result = result.filter((t) => t.gateway === gatewayFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    return result;
  }, [transactions, searchQuery, gatewayFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Refund handler
  const handleRefund = async () => {
    if (!refundItem) return;
    try {
      // In production, this would call the payment gateway API
      const { error } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded' })
        .eq('id', refundItem.id);

      if (error) throw error;

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === refundItem.id ? { ...t, status: 'refunded' } : t
        )
      );
      toast({ title: '✅ Refund processed' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setRefundItem(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['User Email', 'Gateway', 'Amount', 'Currency', 'Status', 'Plan', 'Credits', 'Transaction ID', 'Date'];
    const rows = filteredItems.map((t) => [
      t.user_email,
      t.gateway,
      t.amount,
      t.currency,
      t.status,
      t.plan_name,
      t.credits_purchased,
      t.transaction_id,
      new Date(t.created_at).toISOString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '✅ CSV exported' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" /> Success
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
            <RotateCcw className="w-3 h-3" /> Refunded
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">
            <Loader2 className="w-3 h-3" /> Pending
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${stats.total.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-green-400" />}
        />
        <StatCard
          label="This Month"
          value={`$${stats.thisMonth.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
        />
        <StatCard
          label="Successful"
          value={stats.successful.toString()}
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
        />
        <StatCard
          label="Failed"
          value={stats.failed.toString()}
          icon={<XCircle className="w-5 h-5 text-red-400" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or transaction ID..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg"
          />
        </div>

        <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
          <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Gateway" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Gateways</SelectItem>
            <SelectItem value="razorpay">Razorpay</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Gateway
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Plan
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No transactions found</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {tx.user_email || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-gray-400">
                      {tx.gateway}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-white">
                      {tx.currency || '$'}{tx.amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {tx.plan_name || 'N/A'}
                      {tx.credits_purchased && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({tx.credits_purchased} credits)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {tx.transaction_id?.substring(0, 16)}...
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {tx.status === 'success' && (
                          <button
                            onClick={() => setRefundItem(tx)}
                            className="p-1.5 rounded hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400"
                            title="Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border-gray-700 text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border-gray-700 text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Confirmation */}
      <AlertDialog open={!!refundItem} onOpenChange={() => setRefundItem(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Process Refund?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will refund ${refundItem?.amount?.toFixed(2)} to {refundItem?.user_email}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund} className="bg-yellow-600 hover:bg-yellow-700">
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold mt-2 text-white">{value}</p>
    </div>
  );
}
