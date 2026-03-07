/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * History Viewer - Admin Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Two tabs: Prompt History & Chat History
 * - Search, filters, date range
 * - View full details in modal
 * - Flag/unflag with reason
 * - CSV export
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
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
  Flag,
  Trash2,
  Loader2,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PromptHistoryItem {
  id: string;
  user_id: string;
  user_email: string;
  type: 'basic' | 'advanced' | 'cot' | 'template';
  input_text: string;
  output_text: string;
  model: string;
  credits_used: number;
  template_id: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
}

interface ChatHistoryItem {
  id: string;
  user_id: string;
  user_email: string;
  session_id: string;
  messages: ChatMessage[];
  model: string;
  total_messages: number;
  credits_used: number;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

type DateRange = 'today' | '7days' | '30days' | 'all';

const ITEMS_PER_PAGE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function HistoryViewer() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'chats'>('prompts');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">History Viewer</h1>
        <p className="text-muted-foreground text-sm">
          View all prompt generations and chat sessions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="bg-muted border border-border">
          <TabsTrigger
            value="prompts"
            className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
          >
            <FileText className="w-4 h-4" />
            Prompt History
          </TabsTrigger>
          <TabsTrigger
            value="chats"
            className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="mt-6">
          <PromptHistoryTab />
        </TabsContent>

        <TabsContent value="chats" className="mt-6">
          <ChatHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT HISTORY TAB
// ─────────────────────────────────────────────────────────────────────────────

function PromptHistoryTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<PromptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [viewItem, setViewItem] = useState<PromptHistoryItem | null>(null);
  const [flagItem, setFlagItem] = useState<PromptHistoryItem | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [deleteItem, setDeleteItem] = useState<PromptHistoryItem | null>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: '❌ Error loading history',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.user_email?.toLowerCase().includes(q) ||
          item.input_text?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter);
    }

    // Date range
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoff: Date;
      switch (dateRange) {
        case 'today':
          cutoff = new Date(now.setHours(0, 0, 0, 0));
          break;
        case '7days':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      result = result.filter((item) => new Date(item.created_at) >= cutoff);
    }

    // Flag filter
    if (flagFilter === 'flagged') {
      result = result.filter((item) => item.is_flagged);
    } else if (flagFilter === 'clean') {
      result = result.filter((item) => !item.is_flagged);
    }

    // Sorting
    result.sort((a, b) => {
      const aVal = sortField === 'created_at' ? new Date(a.created_at).getTime() : (a as any)[sortField];
      const bVal = sortField === 'created_at' ? new Date(b.created_at).getTime() : (b as any)[sortField];
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

    return result;
  }, [items, searchQuery, typeFilter, dateRange, flagFilter, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: items.length,
      today: items.filter((i) => new Date(i.created_at) >= today).length,
      flagged: items.filter((i) => i.is_flagged).length,
      credits: items.reduce((sum, i) => sum + (i.credits_used || 0), 0),
    };
  }, [items]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Actions
  const handleFlag = async () => {
    if (!flagItem) return;
    try {
      const newFlagged = !flagItem.is_flagged;
      const { error } = await supabase
        .from('prompt_history')
        .update({
          is_flagged: newFlagged,
          flag_reason: newFlagged ? flagReason : null,
        })
        .eq('id', flagItem.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) =>
          i.id === flagItem.id
            ? { ...i, is_flagged: newFlagged, flag_reason: newFlagged ? flagReason : null }
            : i
        )
      );
      toast({ title: newFlagged ? '🚩 Flagged' : '✅ Unflagged' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setFlagItem(null);
      setFlagReason('');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const { error } = await supabase.from('prompt_history').delete().eq('id', deleteItem.id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      toast({ title: '✅ Deleted' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleteItem(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User Email', 'Type', 'Input', 'Output', 'Model', 'Credits', 'Flagged', 'Date'];
    const rows = filteredItems.map((i) => [
      i.user_email,
      i.type,
      `"${(i.input_text || '').replace(/"/g, '""')}"`,
      `"${(i.output_text || '').replace(/"/g, '""')}"`,
      i.model,
      i.credits_used,
      i.is_flagged ? 'Yes' : 'No',
      new Date(i.created_at).toISOString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '✅ CSV exported' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Prompts" value={stats.total} />
        <StatCard label="Today" value={stats.today} />
        <StatCard label="Flagged" value={stats.flagged} color="red" />
        <StatCard label="Credits Used" value={stats.credits} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or input..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px] bg-muted border-border text-white">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="cot">CoT</SelectItem>
            <SelectItem value="template">Template</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
          <SelectTrigger className="w-[140px] bg-muted border-border text-white">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={flagFilter} onValueChange={setFlagFilter}>
          <SelectTrigger className="w-[120px] bg-muted border-border text-white">
            <SelectValue placeholder="Flag" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="border-border text-muted-foreground hover:bg-muted gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-muted border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Input
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Model
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Credits
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Flagged
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">No prompts found</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.user_email || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        item.type === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                        item.type === 'advanced' ? 'bg-purple-500/20 text-purple-400' :
                        item.type === 'cot' ? 'bg-green-500/20 text-green-400' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {item.type || 'basic'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[300px] truncate">
                      {item.input_text?.substring(0, 60)}...
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {item.model}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {item.credits_used}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.is_flagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">
                          <Flag className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewItem(item)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-white"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setFlagItem(item);
                            setFlagReason(item.flag_reason || '');
                          }}
                          className={`p-1.5 rounded hover:bg-muted ${
                            item.is_flagged ? 'text-red-400' : 'text-muted-foreground hover:text-white'
                          }`}
                          title="Flag"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border-border text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border-border text-muted-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="bg-muted border-border max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Prompt Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {viewItem.user_email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">{viewItem.user_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(viewItem.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`ml-auto px-2 py-0.5 text-xs rounded ${
                  viewItem.type === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                  viewItem.type === 'advanced' ? 'bg-purple-500/20 text-purple-400' :
                  viewItem.type === 'cot' ? 'bg-green-500/20 text-green-400' :
                  'bg-primary/20 text-primary'
                }`}>
                  {viewItem.type}
                </span>
              </div>

              {/* Input */}
              <div>
                <label className="text-xs text-muted-foreground uppercase">Input</label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewItem.input_text}
                </div>
              </div>

              {/* Output */}
              <div>
                <label className="text-xs text-muted-foreground uppercase">Output</label>
                <div className="mt-1 p-3 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {viewItem.output_text}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Model: {viewItem.model}</span>
                <span>Credits: {viewItem.credits_used}</span>
                {viewItem.is_flagged && (
                  <span className="text-red-400">
                    Flagged: {viewItem.flag_reason || 'No reason'}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={!!flagItem} onOpenChange={() => setFlagItem(null)}>
        <DialogContent className="bg-muted border-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              {flagItem?.is_flagged ? 'Unflag Prompt' : 'Flag Prompt'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!flagItem?.is_flagged && (
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Reason for flagging
                </label>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Enter reason..."
                  rows={3}
                  className="w-full px-3 py-2 bg-muted border border-border text-white rounded-lg"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setFlagItem(null)}
                className="border-border text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFlag}
                className={flagItem?.is_flagged ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {flagItem?.is_flagged ? 'Unflag' : 'Flag'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="bg-muted border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Prompt?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete this prompt history entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-muted-foreground border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT HISTORY TAB
// ─────────────────────────────────────────────────────────────────────────────

function ChatHistoryTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [viewItem, setViewItem] = useState<ChatHistoryItem | null>(null);
  const [flagItem, setFlagItem] = useState<ChatHistoryItem | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [deleteItem, setDeleteItem] = useState<ChatHistoryItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: '❌ Error loading chats',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.user_email?.toLowerCase().includes(q));
    }

    if (dateRange !== 'all') {
      const now = new Date();
      let cutoff: Date;
      switch (dateRange) {
        case 'today':
          cutoff = new Date(now.setHours(0, 0, 0, 0));
          break;
        case '7days':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      result = result.filter((item) => new Date(item.created_at) >= cutoff);
    }

    if (flagFilter === 'flagged') {
      result = result.filter((item) => item.is_flagged);
    } else if (flagFilter === 'clean') {
      result = result.filter((item) => !item.is_flagged);
    }

    return result;
  }, [items, searchQuery, dateRange, flagFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    messages: items.reduce((sum, i) => sum + (i.total_messages || (i.messages?.length || 0)), 0),
    flagged: items.filter((i) => i.is_flagged).length,
    credits: items.reduce((sum, i) => sum + (i.credits_used || 0), 0),
  }), [items]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Actions
  const handleFlag = async () => {
    if (!flagItem) return;
    try {
      const newFlagged = !flagItem.is_flagged;
      const { error } = await supabase
        .from('chat_history')
        .update({
          is_flagged: newFlagged,
          flag_reason: newFlagged ? flagReason : null,
        })
        .eq('id', flagItem.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) =>
          i.id === flagItem.id
            ? { ...i, is_flagged: newFlagged, flag_reason: newFlagged ? flagReason : null }
            : i
        )
      );
      toast({ title: newFlagged ? '🚩 Flagged' : '✅ Unflagged' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setFlagItem(null);
      setFlagReason('');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const { error } = await supabase.from('chat_history').delete().eq('id', deleteItem.id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      toast({ title: '✅ Deleted' });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleteItem(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User Email', 'Messages', 'Credits', 'Model', 'Flagged', 'Date'];
    const rows = filteredItems.map((i) => [
      i.user_email,
      i.total_messages || i.messages?.length || 0,
      i.credits_used,
      i.model,
      i.is_flagged ? 'Yes' : 'No',
      new Date(i.created_at).toISOString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '✅ CSV exported' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={stats.total} />
        <StatCard label="Total Messages" value={stats.messages} />
        <StatCard label="Flagged" value={stats.flagged} color="red" />
        <StatCard label="Credits Used" value={stats.credits} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
          />
        </div>

        <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
          <SelectTrigger className="w-[140px] bg-muted border-border text-white">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={flagFilter} onValueChange={setFlagFilter}>
          <SelectTrigger className="w-[120px] bg-muted border-border text-white">
            <SelectValue placeholder="Flag" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="border-border text-muted-foreground hover:bg-muted gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-muted border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Messages
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Credits
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Model
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Flagged
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">No chat sessions found</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.user_email || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {item.total_messages || item.messages?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {item.credits_used}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {item.model}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.is_flagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">
                          <Flag className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewItem(item)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-white"
                          title="View Conversation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setFlagItem(item);
                            setFlagReason(item.flag_reason || '');
                          }}
                          className={`p-1.5 rounded hover:bg-muted ${
                            item.is_flagged ? 'text-red-400' : 'text-muted-foreground hover:text-white'
                          }`}
                          title="Flag"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border-border text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border-border text-muted-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Modal */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="bg-muted border-border max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Chat Conversation</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg sticky top-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {viewItem.user_email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">{viewItem.user_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {viewItem.total_messages || viewItem.messages?.length || 0} messages • {viewItem.credits_used} credits
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3 px-1">
                {(viewItem.messages || []).map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-muted text-muted-foreground rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.timestamp && (
                        <p className={`text-xs mt-1 ${
                          msg.role === 'user' ? 'text-indigo-200' : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Flag Status */}
              {viewItem.is_flagged && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    <Flag className="w-4 h-4 inline mr-2" />
                    Flagged: {viewItem.flag_reason || 'No reason provided'}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={!!flagItem} onOpenChange={() => setFlagItem(null)}>
        <DialogContent className="bg-muted border-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              {flagItem?.is_flagged ? 'Unflag Chat' : 'Flag Chat'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!flagItem?.is_flagged && (
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Reason for flagging
                </label>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Enter reason..."
                  rows={3}
                  className="w-full px-3 py-2 bg-muted border border-border text-white rounded-lg"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setFlagItem(null)}
                className="border-border text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFlag}
                className={flagItem?.is_flagged ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {flagItem?.is_flagged ? 'Unflag' : 'Flag'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="bg-muted border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Chat Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete this chat session and all messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-muted-foreground border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
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
  color = 'white',
}: {
  label: string;
  value: number;
  color?: 'white' | 'red';
}) {
  return (
    <div className="bg-muted border border-border rounded-xl p-4">
      <p className="text-muted-foreground text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color === 'red' ? 'text-red-400' : 'text-white'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
