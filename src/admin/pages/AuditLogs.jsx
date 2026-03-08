import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Shield,
  Eye,
  Download,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Globe,
  Laptop,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { supabase } from '../../lib/supabase';

const actionIcons = {
  login: Shield,
  logout: Shield,
  user_created: User,
  user_deleted: XCircle,
  user_updated: User,
  prompt_generated: Activity,
  settings_updated: Activity,
  subscription_changed: Activity,
  payment_processed: CheckCircle,
  payment_failed: XCircle,
  api_key_rotated: Shield,
  admin_action: AlertTriangle,
};

const actionVariants = {
  login: 'success',
  logout: 'neutral',
  user_created: 'info',
  user_deleted: 'danger',
  user_updated: 'info',
  prompt_generated: 'purple',
  settings_updated: 'warning',
  subscription_changed: 'success',
  payment_processed: 'success',
  payment_failed: 'danger',
  api_key_rotated: 'warning',
  admin_action: 'warning',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('7days');
  const [expandedLog, setExpandedLog] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 15;
  const actions = [...new Set(logs.map(l => l.action))];

  // Fetch audit logs from Supabase
  const fetchLogs = async () => {
    setLoading(true);
    try {
      let data = null;
      let error = null;

      // Try RPC function first (bypasses RLS)
      try {
        const rpcResult = await supabase.rpc('get_all_audit_logs');
        if (!rpcResult.error && rpcResult.data && rpcResult.data.length > 0) {
          data = rpcResult.data;
          console.log('Fetched audit logs via RPC:', data.length);
        } else if (rpcResult.error) {
          console.log('RPC not available:', rpcResult.error.message);
        }
      } catch (e) {
        console.log('RPC function not available, trying direct query');
      }

      // Fallback to direct query
      if (!data || data.length === 0) {
        const result = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching audit logs:', error);
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('Audit logs table not found. Please run the fix_audit_logs.sql migration.');
        }
        setLogs([]);
        return;
      }

      const mappedLogs = (data || []).map(log => ({
        id: log.id,
        user: log.user_email || log.user_id || 'System',
        action: log.action || 'unknown',
        description: log.description || '',
        timestamp: log.created_at,
        ip: log.ip_address || null,
        userAgent: log.user_agent || null,
        metadata: log.metadata || {},
        status: log.status || 'success',
      }));

      setLogs(mappedLogs);
      console.log('Loaded audit logs:', mappedLogs.length);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip?.includes(searchQuery);
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    // Date range filter
    const logDate = new Date(log.timestamp);
    const now = new Date();
    let matchesDate = true;
    
    if (filterDateRange === '24hours') {
      matchesDate = (now - logDate) < 24 * 60 * 60 * 1000;
    } else if (filterDateRange === '7days') {
      matchesDate = (now - logDate) < 7 * 24 * 60 * 60 * 1000;
    } else if (filterDateRange === '30days') {
      matchesDate = (now - logDate) < 30 * 24 * 60 * 60 * 1000;
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleExpand = (logId) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Description', 'IP Address', 'User Agent'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        `"${log.description}"`,
        log.ip || '',
        `"${log.userAgent || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Stats
  const stats = [
    { label: 'Total Events', value: filteredLogs.length, icon: Activity, color: 'indigo' },
    { label: 'Security Events', value: filteredLogs.filter(l => ['login', 'logout', 'api_key_rotated'].includes(l.action)).length, icon: Shield, color: 'emerald' },
    { label: 'User Changes', value: filteredLogs.filter(l => l.action.includes('user_')).length, icon: User, color: 'blue' },
    { label: 'Failed Actions', value: filteredLogs.filter(l => l.action.includes('failed') || l.status === 'failed').length, icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Audit Logs</h2>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search logs by user, action, IP..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-muted-foreground text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={filterDateRange}
            onChange={(e) => { setFilterDateRange(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-muted-foreground text-sm focus:outline-none focus:border-primary"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Refresh */}
          <button
            onClick={() => alert('Logs refreshed')}
            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="w-8 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No logs found matching your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => {
                  const ActionIcon = actionIcons[log.action] || Activity;
                  const isExpanded = expandedLog === log.id;
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="text-muted-foreground hover:text-white"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="text-sm text-white">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            label={log.action.replace(/_/g, ' ')}
                            variant={actionVariants[log.action] || 'neutral'}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {log.description}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            <code className="text-xs text-muted-foreground font-mono">{log.ip || '-'}</code>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setViewDetails(log)}
                            className="text-muted-foreground hover:text-white"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-muted/30">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">User Agent</p>
                                <p className="text-muted-foreground text-xs font-mono break-all">
                                  {log.userAgent || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Request ID</p>
                                <code className="text-muted-foreground text-xs font-mono">
                                  {log.requestId || 'N/A'}
                                </code>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Geographic Location</p>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Globe className="w-3 h-3" />
                                  {log.location || 'Unknown'}
                                </div>
                              </div>
                              {log.metadata && (
                                <div className="md:col-span-3">
                                  <p className="text-xs text-muted-foreground uppercase mb-1">Additional Data</p>
                                  <pre className="p-3 bg-background rounded-lg text-xs text-muted-foreground font-mono overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Retention Notice */}
      <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Audit logs are retained for 90 days. For longer retention periods, export logs regularly or upgrade to Enterprise plan.
        </p>
      </div>

      {/* View Details Modal */}
      <Modal isOpen={!!viewDetails} onClose={() => setViewDetails(null)} title="Audit Log Details" size="lg">
        {viewDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Timestamp</p>
                <p className="text-white">{new Date(viewDetails.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">User</p>
                <p className="text-white">{viewDetails.user}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Action</p>
                <Badge
                  label={viewDetails.action.replace(/_/g, ' ')}
                  variant={actionVariants[viewDetails.action] || 'neutral'}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">IP Address</p>
                <code className="text-muted-foreground font-mono">{viewDetails.ip || 'N/A'}</code>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Description</p>
              <p className="text-muted-foreground">{viewDetails.description}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">User Agent</p>
              <p className="text-sm text-muted-foreground font-mono break-all">{viewDetails.userAgent || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Location</p>
              <p className="text-muted-foreground">{viewDetails.location || 'Unknown'}</p>
            </div>

            {viewDetails.metadata && (
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Metadata</p>
                <pre className="p-4 bg-background rounded-lg text-sm text-muted-foreground font-mono overflow-x-auto">
                  {JSON.stringify(viewDetails.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Request ID</p>
              <code className="text-muted-foreground font-mono text-sm">{viewDetails.requestId || 'N/A'}</code>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
