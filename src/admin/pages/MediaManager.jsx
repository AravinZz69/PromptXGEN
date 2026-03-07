/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MediaManager Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing media files
 * - Upload multiple files (drag & drop + browse)
 * - Grid view of uploaded files
 * - Copy URL functionality
 * - Delete files
 * - Search files
 * - Lightbox for full image view
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
import { Progress } from '@/components/ui/progress';
import { Upload, X, Copy, Trash2, Loader2, Search, FileImage, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 20;

export function MediaManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('cms-media')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const filesWithUrls = data.map((file) => {
        const { data: urlData } = supabase.storage
          .from('cms-media')
          .getPublicUrl(file.name);
        return {
          ...file,
          url: urlData.publicUrl,
        };
      });

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error loading files',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileList) => {
    try {
      setUploading(true);
      const uploadPromises = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const uploadPromise = supabase.storage
          .from('cms-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })
          .then(() => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
          });

        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);

      toast({
        title: '✅ Upload successful',
        description: `${fileList.length} file(s) uploaded successfully.`,
      });

      await fetchFiles();
      setShowUploadZone(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: '❌ Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast({
      title: '✅ Copied',
      description: 'URL copied to clipboard',
    });
  };

  const handleDeleteFile = async (fileName) => {
    try {
      const { error } = await supabase.storage
        .from('cms-media')
        .remove([fileName]);

      if (error) throw error;

      toast({
        title: '✅ Deleted',
        description: 'File deleted successfully',
      });

      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: '❌ Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteFile(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Manager</h1>
          <p className="text-muted-foreground text-sm">
            Manage your website's media files
          </p>
        </div>
        <Button
          onClick={() => setShowUploadZone(!showUploadZone)}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-10 pr-4 py-2 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg"
        />
      </div>

      {/* Upload Zone */}
      {showUploadZone && (
        <div className="bg-muted border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Upload Files</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowUploadZone(false)}
              className="text-muted-foreground hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center
              cursor-pointer transition-all
              ${isDragging
                ? 'border-indigo-500 bg-primary/10'
                : 'border-border hover:border-border bg-muted/50'
              }
              ${uploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <div className="flex flex-col items-center gap-4">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {uploading ? 'Uploading files...' : 'Drag & drop files here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP, SVG, GIF (max 5MB each)
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate flex-1">{fileName}</span>
                    <span className="text-muted-foreground ml-2">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : paginatedFiles.length === 0 ? (
        <div className="bg-muted border border-border rounded-xl p-12 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <FileImage className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-white">No files yet</h3>
            <p className="text-muted-foreground text-sm">
              Upload your first media file to get started.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paginatedFiles.map((file) => (
              <div
                key={file.id}
                className="group relative bg-muted border border-border rounded-lg overflow-hidden hover:border-border transition-all"
              >
                {/* Image */}
                <div
                  className="aspect-square bg-muted cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyUrl(file.url)}
                    className="bg-muted text-white hover:bg-muted"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteFile(file)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* File info */}
                <div className="p-2 border-t border-border">
                  <p className="text-xs text-muted-foreground truncate">{file.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(file.metadata?.size || 0)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border text-muted-foreground hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border text-muted-foreground hover:bg-muted"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="bg-muted border-border max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={selectedFile?.url}
              alt={selectedFile?.name}
              className="w-full rounded-lg"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedFile?.url || ''}
                readOnly
                className="flex-1 bg-muted border border-border text-white rounded px-3 py-2 text-sm font-mono"
              />
              <Button
                onClick={() => handleCopyUrl(selectedFile?.url)}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Size: {formatFileSize(selectedFile?.metadata?.size || 0)}</p>
              <p>Uploaded: {new Date(selectedFile?.created_at).toLocaleString()}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent className="bg-muted border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete File?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete "{deleteFile?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteFile(deleteFile?.name)}
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

export default MediaManager;
