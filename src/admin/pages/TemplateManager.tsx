/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Template Manager - Admin Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Full CRUD for prompt templates with:
 * - List view with search, filters, bulk actions
 * - Editor mode with variable detection
 * - Live preview
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  Search,
  Eye,
  EyeOff,
  Crown,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowLeft,
  Star,
  X,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TemplateVariable {
  name: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  icon: string;
  prompt_template: string;
  variables: TemplateVariable[];
  tags: string[];
  role: 'student' | 'teacher' | 'both';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_pro: boolean;
  is_visible: boolean;
  is_featured: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

type SortField = 'title' | 'category' | 'usage_count' | 'created_at';
type SortDirection = 'asc' | 'desc';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'K12',
  'Engineering',
  'Medical',
  'UPSC',
  'Commerce',
  'JEE-NEET',
  'Coding',
  'Business',
  'Marketing',
  'Other',
];

const ROLES = ['student', 'teacher', 'both'] as const;
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
const ITEMS_PER_PAGE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function TemplateManager() {
  const { toast } = useToast();

  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ───────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ───────────────────────────────────────────────────────────────────────────

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: '❌ Error loading templates',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // FILTERING & SORTING
  // ───────────────────────────────────────────────────────────────────────────

  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((t) => t.role === roleFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((t) => t.is_visible);
    } else if (statusFilter === 'hidden') {
      result = result.filter((t) => !t.is_visible);
    } else if (statusFilter === 'pro') {
      result = result.filter((t) => t.is_pro);
    } else if (statusFilter === 'featured') {
      result = result.filter((t) => t.is_featured);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [templates, searchQuery, categoryFilter, roleFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter((t) => t.is_visible).length,
    pro: templates.filter((t) => t.is_pro).length,
    totalUses: templates.reduce((sum, t) => sum + t.usage_count, 0),
  }), [templates]);

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ───────────────────────────────────────────────────────────────────────────

  const handleToggleField = async (
    id: string,
    field: 'is_visible' | 'is_pro' | 'is_featured',
    value: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );

      toast({ title: '✅ Updated successfully' });
    } catch (error: any) {
      toast({
        title: '❌ Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const newTemplate = {
        ...template,
        id: undefined,
        title: `${template.title} (Copy)`,
        usage_count: 0,
        created_at: undefined,
        updated_at: undefined,
      };

      const { error } = await supabase.from('templates').insert([newTemplate]);

      if (error) throw error;

      toast({ title: '✅ Template duplicated' });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: '❌ Duplicate failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplate) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', deleteTemplate.id);

      if (error) throw error;

      setTemplates((prev) => prev.filter((t) => t.id !== deleteTemplate.id));
      toast({ title: '✅ Template deleted' });
    } catch (error: any) {
      toast({
        title: '❌ Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteTemplate(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);

    try {
      let updateData: Partial<Template> = {};

      switch (action) {
        case 'enable':
          updateData = { is_visible: true };
          break;
        case 'disable':
          updateData = { is_visible: false };
          break;
        case 'makePro':
          updateData = { is_pro: true };
          break;
        case 'makeFree':
          updateData = { is_pro: false };
          break;
        case 'delete':
          const { error: deleteError } = await supabase
            .from('templates')
            .delete()
            .in('id', ids);
          if (deleteError) throw deleteError;
          setTemplates((prev) => prev.filter((t) => !selectedIds.has(t.id)));
          setSelectedIds(new Set());
          toast({ title: `✅ Deleted ${ids.length} templates` });
          return;
      }

      const { error } = await supabase
        .from('templates')
        .update(updateData)
        .in('id', ids);

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((t) => (selectedIds.has(t.id) ? { ...t, ...updateData } : t))
      );
      setSelectedIds(new Set());
      toast({ title: `✅ Updated ${ids.length} templates` });
    } catch (error: any) {
      toast({
        title: '❌ Bulk action failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // EDIT MODE
  // ───────────────────────────────────────────────────────────────────────────

  const openEditor = (template?: Template) => {
    setEditingTemplate(
      template || {
        id: '',
        title: '',
        description: '',
        category: 'K12',
        subcategory: '',
        icon: '📝',
        prompt_template: '',
        variables: [],
        tags: [],
        role: 'both',
        difficulty: 'beginner',
        is_pro: false,
        is_visible: true,
        is_featured: false,
        usage_count: 0,
        created_at: '',
        updated_at: '',
      }
    );
    setMode('edit');
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mode === 'edit' && editingTemplate) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={async (savedTemplate) => {
          await fetchTemplates();
          setMode('list');
          setEditingTemplate(null);
        }}
        onCancel={() => {
          setMode('list');
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Template Manager</h1>
          <p className="text-muted-foreground text-sm">
            Manage prompt templates for users
          </p>
        </div>
        <Button
          onClick={() => openEditor()}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Templates" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Pro Templates" value={stats.pro} />
        <StatCard label="Total Uses" value={stats.totalUses} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px] bg-muted border-border text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[130px] bg-muted border-border text-white">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] bg-muted border-border text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-muted border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="pro">Pro Only</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-indigo-500/30 rounded-lg">
          <span className="text-sm text-primary">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('enable')}
            className="border-border text-muted-foreground"
          >
            Enable
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('disable')}
            className="border-border text-muted-foreground"
          >
            Disable
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('makePro')}
            className="border-border text-muted-foreground"
          >
            Make Pro
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('makeFree')}
            className="border-border text-muted-foreground"
          >
            Make Free
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleBulkAction('delete')}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            className="text-muted-foreground"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-muted border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === paginatedTemplates.length &&
                      paginatedTemplates.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(
                          new Set(paginatedTemplates.map((t) => t.id))
                        );
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    className="w-4 h-4 rounded border-border bg-muted"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Icon
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-white"
                  onClick={() => toggleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    Title
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-white"
                  onClick={() => toggleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Difficulty
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Pro
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Visible
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-white"
                  onClick={() => toggleSort('usage_count')}
                >
                  <div className="flex items-center gap-1">
                    Uses
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedTemplates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <LayoutTemplate className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">No templates found</p>
                    <Button
                      onClick={() => openEditor()}
                      className="mt-3 bg-primary hover:bg-primary/90"
                    >
                      Create First Template
                    </Button>
                  </td>
                </tr>
              ) : (
                paginatedTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(template.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedIds);
                          if (e.target.checked) {
                            newSet.add(template.id);
                          } else {
                            newSet.delete(template.id);
                          }
                          setSelectedIds(newSet);
                        }}
                        className="w-4 h-4 rounded border-border bg-muted"
                      />
                    </td>
                    <td className="px-4 py-3 text-2xl">{template.icon}</td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">
                        {template.title}
                      </div>
                      {template.is_featured && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm capitalize">
                      {template.role}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          template.difficulty === 'beginner'
                            ? 'bg-green-500/20 text-green-400'
                            : template.difficulty === 'intermediate'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {template.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          handleToggleField(
                            template.id,
                            'is_pro',
                            !template.is_pro
                          )
                        }
                        className={`p-1 rounded ${
                          template.is_pro
                            ? 'text-yellow-400 bg-yellow-500/20'
                            : 'text-muted-foreground hover:text-muted-foreground'
                        }`}
                      >
                        <Crown className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          handleToggleField(
                            template.id,
                            'is_visible',
                            !template.is_visible
                          )
                        }
                        className={`p-1 rounded ${
                          template.is_visible
                            ? 'text-green-400 bg-green-500/20'
                            : 'text-muted-foreground hover:text-muted-foreground'
                        }`}
                      >
                        {template.is_visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {template.usage_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditor(template)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(template)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-white"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTemplate(template)}
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

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTemplate}
        onOpenChange={() => setDeleteTemplate(null)}
      >
        <AlertDialogContent className="bg-muted border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete "{deleteTemplate?.title}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted border border-border rounded-xl p-4">
      <p className="text-muted-foreground text-xs uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE EDITOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(template);
  const [tagsInput, setTagsInput] = useState(template.tags.join(', '));

  // Detect variables from prompt template
  const detectedVariables = useMemo(() => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(form.prompt_template)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  }, [form.prompt_template]);

  // Update variables when prompt changes
  useEffect(() => {
    const newVariables = detectedVariables.map((name) => {
      const existing = form.variables.find((v) => v.name === name);
      return (
        existing || {
          name,
          label: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
          placeholder: `Enter ${name}`,
          type: 'text' as const,
          required: true,
        }
      );
    });
    setForm((prev) => ({ ...prev, variables: newVariables }));
  }, [detectedVariables]);

  const handleSave = async () => {
    if (!form.title || !form.prompt_template || !form.category) {
      toast({
        title: '❌ Validation Error',
        description: 'Title, Category, and Prompt Template are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const saveData = {
        ...form,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      };

      if (form.id) {
        // Update
        const { error } = await supabase
          .from('templates')
          .update(saveData)
          .eq('id', form.id);
        if (error) throw error;
      } else {
        // Insert
        const { id, created_at, updated_at, ...insertData } = saveData;
        const { error } = await supabase.from('templates').insert([insertData]);
        if (error) throw error;
      }

      toast({ title: '✅ Template saved successfully' });
      onSave(form);
    } catch (error: any) {
      toast({
        title: '❌ Save failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateVariable = (
    index: number,
    field: keyof TemplateVariable,
    value: any
  ) => {
    const newVariables = [...form.variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setForm((prev) => ({ ...prev, variables: newVariables }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {template.id ? 'Edit Template' : 'New Template'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure your prompt template
          </p>
        </div>
      </div>

      {/* Two-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - 65% */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Essay Topic Generator"
              className="w-full px-4 py-2 bg-muted border border-border text-white rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Description
            </label>
            <textarea
              value={form.description || ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of what this template does"
              rows={2}
              className="w-full px-4 py-2 bg-muted border border-border text-white rounded-lg resize-none"
            />
          </div>

          {/* Prompt Template */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Prompt Template <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.prompt_template}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, prompt_template: e.target.value }))
              }
              placeholder="Write your prompt here. Use {{variable_name}} for dynamic content."
              rows={10}
              className="w-full px-4 py-3 bg-muted border border-border text-white rounded-lg resize-y font-mono text-sm"
              style={{ minHeight: '300px' }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use <code className="bg-muted px-1 rounded">{'{{variable_name}}'}</code> for dynamic variables
            </p>
          </div>

          {/* Variables */}
          {detectedVariables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Variables ({detectedVariables.length} detected)
              </label>
              <div className="space-y-3">
                {form.variables.map((variable, index) => (
                  <div
                    key={variable.name}
                    className="grid grid-cols-5 gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Variable
                      </label>
                      <code className="text-primary text-sm">
                        {`{{${variable.name}}}`}
                      </code>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={variable.label}
                        onChange={(e) =>
                          updateVariable(index, 'label', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm bg-muted border border-border text-white rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={variable.placeholder}
                        onChange={(e) =>
                          updateVariable(index, 'placeholder', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm bg-muted border border-border text-white rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Type
                      </label>
                      <select
                        value={variable.type}
                        onChange={(e) =>
                          updateVariable(index, 'type', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm bg-muted border border-border text-white rounded"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) =>
                            updateVariable(index, 'required', e.target.checked)
                          }
                          className="w-4 h-4 rounded border-border bg-muted"
                        />
                        <span className="text-xs text-muted-foreground">Required</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., education, writing, essays"
              className="w-full px-4 py-2 bg-muted border border-border text-white rounded-lg"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagsInput
                  .split(',')
                  .map((t) => t.trim())
                  .filter((t) => t)
                  .map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - 35% */}
        <div className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((prev) => ({ ...prev, category: v }))}
            >
              <SelectTrigger className="w-full bg-muted border-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Subcategory
            </label>
            <input
              type="text"
              value={form.subcategory || ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subcategory: e.target.value }))
              }
              placeholder="e.g., Physics, Writing"
              className="w-full px-4 py-2 bg-muted border border-border text-white rounded-lg"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Role
            </label>
            <Select
              value={form.role}
              onValueChange={(v: any) => setForm((prev) => ({ ...prev, role: v }))}
            >
              <SelectTrigger className="w-full bg-muted border-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Difficulty
            </label>
            <Select
              value={form.difficulty}
              onValueChange={(v: any) =>
                setForm((prev) => ({ ...prev, difficulty: v }))
              }
            >
              <SelectTrigger className="w-full bg-muted border-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Icon (emoji)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={form.icon}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                maxLength={4}
                className="w-20 px-3 py-2 bg-muted border border-border text-white text-center text-2xl rounded-lg"
              />
              <span className="text-4xl">{form.icon}</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Pro Template</span>
              </div>
              <Switch
                checked={form.is_pro}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, is_pro: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Visible</span>
              </div>
              <Switch
                checked={form.is_visible}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, is_visible: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Featured</span>
              </div>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, is_featured: v }))
                }
              />
            </div>
          </div>

          {/* Preview Card */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Preview</h3>
            <div className="p-4 bg-muted rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{form.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-white truncate">
                      {form.title || 'Template Title'}
                    </h4>
                    {form.is_pro && (
                      <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> PRO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {form.description || 'Template description will appear here'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                      {form.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        form.difficulty === 'beginner'
                          ? 'bg-green-500/20 text-green-400'
                          : form.difficulty === 'intermediate'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {form.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-border text-muted-foreground hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {template.id ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}
