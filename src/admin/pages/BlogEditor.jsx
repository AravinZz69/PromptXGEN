/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BlogEditor Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing blog posts
 * TWO MODES:
 * - List View: Table of all posts with search/filter
 * - Editor View: Full post editor with SEO fields
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, ArrowLeft, Pencil, Trash2, Eye, Loader2, Search, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/admin/components/cms/ImageUpload';

const CATEGORIES = ['General', 'Tutorial', 'AI Tips', 'News', 'Product Updates'];

export function BlogEditor() {
  const [mode, setMode] = useState('list'); // 'list' or 'editor'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();

  // Editor state
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: 'General',
    author: '',
    tags: '',
    cover_image_url: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
  });

  // Load posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error loading posts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      category: 'General',
      author: '',
      tags: '',
      cover_image_url: '',
      status: 'draft',
      meta_title: '',
      meta_description: '',
    });
    setMode('editor');
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      category: post.category || 'General',
      author: post.author ||'',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      cover_image_url: post.cover_image_url || '',
      status: post.status || 'draft',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
    });
    setMode('editor');
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from title
      if (field === 'title' && !editingPost) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSavePost = async (publishNow = false) => {
    try {
      setSaving(true);

      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        category: formData.category,
        author: formData.author,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        cover_image_url: formData.cover_image_url,
        status: publishNow ? 'published' : formData.status,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      };

      if (editingPost) {
        // Update
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: '✅ Post updated',
          description: 'Your blog post has been updated successfully.',
        });
      } else {
        // Insert
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;

        toast({
          title: '✅ Post created',
          description: 'Your blog post has been created successfully.',
        });
      }

      await fetchPosts();
      setMode('list');
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: '❌ Save failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '✅ Post deleted',
        description: 'The blog post has been deleted.',
      });

      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: '❌ Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // LIST VIEW
  if (mode === 'list') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Blog Manager</h1>
            <p className="text-muted-foreground text-sm">Manage your blog posts</p>
          </div>
          <Button
            onClick={handleNewPost}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-muted border border-border rounded-xl p-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-white">No posts yet</h3>
              <p className="text-muted-foreground text-sm">
                Create your first blog post to get started.
              </p>
              <Button onClick={handleNewPost} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                Create First Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-muted border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Author</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4 text-white font-medium">{post.title}</td>
                      <td className="p-4 text-muted-foreground text-sm">{post.category}</td>
                      <td className="p-4 text-muted-foreground text-sm">{post.author || '-'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            post.status === 'published'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPost(post)}
                            className="text-primary hover:text-indigo-300 hover:bg-primary/90/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            className="text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(post.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="bg-muted border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Post?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will permanently delete this blog post. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeletePost(deleteId)}
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

  // EDITOR VIEW
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setMode('list')}
          className="text-muted-foreground hover:text-white gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSavePost(false)}
            disabled={saving}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSavePost(true)}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Post title..."
              className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-muted-foreground focus:outline-none"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleFieldChange('slug', e.target.value)}
                placeholder="post-slug"
                className="flex-1 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              placeholder="Write your post content here... (Markdown supported)"
              rows={20}
              className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-4 py-3 font-mono text-sm resize-y"
            />
          </div>

          {/* SEO Section */}
          <details className="bg-muted border border-border rounded-xl">
            <summary className="p-4 cursor-pointer text-sm font-medium text-muted-foreground hover:text-white">
              SEO Settings
            </summary>
            <div className="p-4 pt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => handleFieldChange('meta_title', e.target.value)}
                  placeholder="SEO title"
                  className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                  placeholder="SEO description"
                  rows={3}
                  className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2 resize-none"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Right: Metadata */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Publish Settings</h3>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full bg-muted border border-border text-white rounded-lg px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Category & Author */}
          <div className="bg-muted border border-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Organization</h3>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full bg-muted border border-border text-white rounded-lg px-3 py-2"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => handleFieldChange('author', e.target.value)}
                placeholder="Author name"
                className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleFieldChange('tags', e.target.value)}
                placeholder="ai, prompts, tutorial"
                className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
              />
              {formData.tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.split(',').map((tag, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Cover Image</h3>
            <ImageUpload
              bucket="cms-media"
              filePath="blog/"
              currentUrl={formData.cover_image_url}
              onUpload={(url) => handleFieldChange('cover_image_url', url)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogEditor;
