/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Blog Manager - Admin Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Full CRUD for blog posts with:
 * - List view with search, filters, bulk actions
 * - Rich editor for content
 * - SEO fields and preview
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
  Star,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  ArrowLeft,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  tags: string[];
  author_name: string | null;
  author_role: string | null;
  author_avatar: string | null;
  cover_image: string | null;
  read_time: string | null;
  published_at: string | null;
  is_featured: boolean;
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  'Prompt Engineering',
  'Product Updates',
  'AI Trends',
  'Use Cases',
  'Tutorials',
  'News',
  'Case Studies',
];

const ITEMS_PER_PAGE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BlogManager() {
  const { toast } = useToast();

  // State
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteBlog, setDeleteBlog] = useState<Blog | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    category: 'Tutorials',
    tags: '',
    author_name: '',
    author_role: '',
    author_avatar: '',
    cover_image: '',
    read_time: '5 min read',
    published_at: new Date().toISOString().split('T')[0],
    is_featured: false,
    is_published: true,
  });

  // ───────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ───────────────────────────────────────────────────────────────────────────

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      toast({
        title: '❌ Error loading blogs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // FILTERING
  // ───────────────────────────────────────────────────────────────────────────

  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.excerpt?.toLowerCase().includes(query) ||
          b.author_name?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((b) => b.category === categoryFilter);
    }

    if (statusFilter === 'published') {
      result = result.filter((b) => b.is_published);
    } else if (statusFilter === 'draft') {
      result = result.filter((b) => !b.is_published);
    } else if (statusFilter === 'featured') {
      result = result.filter((b) => b.is_featured);
    }

    return result;
  }, [blogs, searchQuery, categoryFilter, statusFilter]);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);

  // ───────────────────────────────────────────────────────────────────────────
  // CRUD OPERATIONS
  // ───────────────────────────────────────────────────────────────────────────

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreate = () => {
    setFormData({
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'Tutorials',
      tags: '',
      author_name: '',
      author_role: '',
      author_avatar: '',
      cover_image: '',
      read_time: '5 min read',
      published_at: new Date().toISOString().split('T')[0],
      is_featured: false,
      is_published: true,
    });
    setEditingBlog(null);
    setMode('edit');
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || 'Tutorials',
      tags: blog.tags?.join(', ') || '',
      author_name: blog.author_name || '',
      author_role: blog.author_role || '',
      author_avatar: blog.author_avatar || '',
      cover_image: blog.cover_image || '',
      read_time: blog.read_time || '5 min read',
      published_at: blog.published_at || new Date().toISOString().split('T')[0],
      is_featured: blog.is_featured,
      is_published: blog.is_published,
    });
    setEditingBlog(blog);
    setMode('edit');
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast({
        title: '⚠️ Missing required fields',
        description: 'Title and slug are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const blogData = {
        slug: formData.slug,
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        author_name: formData.author_name,
        author_role: formData.author_role,
        author_avatar: formData.author_avatar,
        cover_image: formData.cover_image,
        read_time: formData.read_time,
        published_at: formData.published_at,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        updated_at: new Date().toISOString(),
      };

      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', editingBlog.id);
        if (error) throw error;
        toast({ title: '✅ Blog updated successfully' });
      } else {
        const { error } = await supabase.from('blogs').insert([blogData]);
        if (error) throw error;
        toast({ title: '✅ Blog created successfully' });
      }

      await fetchBlogs();
      setMode('list');
    } catch (error: any) {
      toast({
        title: '❌ Error saving blog',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBlog) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', deleteBlog.id);
      if (error) throw error;

      toast({ title: '✅ Blog deleted successfully' });
      await fetchBlogs();
    } catch (error: any) {
      toast({
        title: '❌ Error deleting blog',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteBlog(null);
    }
  };

  const togglePublished = async (blog: Blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ is_published: !blog.is_published })
        .eq('id', blog.id);
      if (error) throw error;
      await fetchBlogs();
    } catch (error: any) {
      toast({
        title: '❌ Error updating blog',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleFeatured = async (blog: Blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ is_featured: !blog.is_featured })
        .eq('id', blog.id);
      if (error) throw error;
      await fetchBlogs();
    } catch (error: any) {
      toast({
        title: '❌ Error updating blog',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: LIST VIEW
  // ───────────────────────────────────────────────────────────────────────────

  if (mode === 'list') {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-500" />
                Blog Manager
              </h1>
              <p className="text-gray-400 mt-1">
                Manage blog posts and articles
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-400">
                {filteredBlogs.length} posts
              </div>
            </div>
          </div>

          {/* Blog List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : paginatedBlogs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No blog posts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Cover Image */}
                    <div className="w-24 h-24 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                      {blog.cover_image ? (
                        <img
                          src={blog.cover_image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white truncate">
                            {blog.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {blog.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {blog.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {blog.is_published ? (
                            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {blog.author_name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {blog.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {blog.published_at}
                        </span>
                        <span>{blog.views} views</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFeatured(blog)}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            blog.is_featured ? 'fill-yellow-500 text-yellow-500' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePublished(blog)}
                        className="text-gray-400 hover:text-white"
                      >
                        {blog.is_published ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(blog)}
                        className="text-gray-400 hover:text-indigo-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteBlog(blog)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-gray-700 text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-gray-400 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-700 text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteBlog} onOpenChange={() => setDeleteBlog(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Delete Blog Post
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteBlog?.title}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: EDIT VIEW
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setMode('list')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              {editingBlog ? 'Edit Post' : 'New Post'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setMode('list')}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingBlog ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  title: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter post title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="post-url-slug"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Brief description of the post"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content (Markdown supported)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={12}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
              placeholder="Write your post content here..."
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="AI, Prompts, Tips"
              />
            </div>
          </div>

          {/* Author Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Author Name
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) =>
                  setFormData({ ...formData, author_name: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Author Role
              </label>
              <input
                type="text"
                value={formData.author_role}
                onChange={(e) =>
                  setFormData({ ...formData, author_role: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Content Writer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Author Avatar URL
              </label>
              <input
                type="text"
                value={formData.author_avatar}
                onChange={(e) =>
                  setFormData({ ...formData, author_avatar: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Images & Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image URL
              </label>
              <input
                type="text"
                value={formData.cover_image}
                onChange={(e) =>
                  setFormData({ ...formData, cover_image: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={formData.read_time}
                onChange={(e) =>
                  setFormData({ ...formData, read_time: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="5 min read"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Publish Date
              </label>
              <input
                type="date"
                value={formData.published_at}
                onChange={(e) =>
                  setFormData({ ...formData, published_at: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked })
                }
              />
              <span className="text-gray-300">Published</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked })
                }
              />
              <span className="text-gray-300">Featured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
