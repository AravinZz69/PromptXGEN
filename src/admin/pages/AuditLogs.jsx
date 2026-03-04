import React, { useState } from 'react';
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
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { mockAuditLogs } from '../mockData';

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
  const [logs, setLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('7days');
  const [expandedLog, setExpandedLog] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 15;
  const actions = [...new Set(logs.map(l => l.action))];

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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search logs by user, action, IP..."
              className="w-full pl-10 pr-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
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
            className="px-3 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Refresh */}
          <button
            onClick={() => alert('Logs refreshed')}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-800/30">
              <tr>
                <th className="w-8 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
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
                      <tr className="border-b border-gray-800/50 hover:bg-gray-800/20">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="text-gray-400 hover:text-white"
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
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-sm text-gray-300">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-gray-400" />
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
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                          {log.description}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <code className="text-xs text-gray-400 font-mono">{log.ip || '-'}</code>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setViewDetails(log)}
                            className="text-gray-400 hover:text-white"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-gray-800/30">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">User Agent</p>
                                <p className="text-gray-300 text-xs font-mono break-all">
                                  {log.userAgent || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Request ID</p>
                                <code className="text-gray-400 text-xs font-mono">
                                  {log.requestId || 'N/A'}
                                </code>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Geographic Location</p>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Globe className="w-3 h-3" />
                                  {log.location || 'Unknown'}
                                </div>
                              </div>
                              {log.metadata && (
                                <div className="md:col-span-3">
                                  <p className="text-xs text-gray-500 uppercase mb-1">Additional Data</p>
                                  <pre className="p-3 bg-[#0A0E1A] rounded-lg text-xs text-gray-400 font-mono overflow-x-auto">
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
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Retention Notice */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-gray-400" />
        <p className="text-sm text-gray-400">
          Audit logs are retained for 90 days. For longer retention periods, export logs regularly or upgrade to Enterprise plan.
        </p>
      </div>

      {/* View Details Modal */}
      <Modal isOpen={!!viewDetails} onClose={() => setViewDetails(null)} title="Audit Log Details" size="lg">
        {viewDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Timestamp</p>
                <p className="text-white">{new Date(viewDetails.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">User</p>
                <p className="text-white">{viewDetails.user}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Action</p>
                <Badge
                  label={viewDetails.action.replace(/_/g, ' ')}
                  variant={actionVariants[viewDetails.action] || 'neutral'}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">IP Address</p>
                <code className="text-gray-300 font-mono">{viewDetails.ip || 'N/A'}</code>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
              <p className="text-gray-300">{viewDetails.description}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">User Agent</p>
              <p className="text-sm text-gray-400 font-mono break-all">{viewDetails.userAgent || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Location</p>
              <p className="text-gray-300">{viewDetails.location || 'Unknown'}</p>
            </div>

            {viewDetails.metadata && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Metadata</p>
                <pre className="p-4 bg-[#0A0E1A] rounded-lg text-sm text-gray-400 font-mono overflow-x-auto">
                  {JSON.stringify(viewDetails.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Request ID</p>
              <code className="text-gray-400 font-mono text-sm">{viewDetails.requestId || 'N/A'}</code>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
