/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ImageUpload Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Drag-and-drop + click-to-browse image upload component
 * Uploads to Supabase Storage and returns public URL
 * 
 * @props
 * - bucket: Supabase storage bucket name (e.g., 'cms-media')
 * - filePath: Path within bucket (e.g., 'hero/', 'team/')
 * - currentUrl: Current image URL (for preview)
 * - onUpload: Callback function(url) called after successful upload
 * - accept: File types to accept (default: image/*)
 * - maxSize: Max file size in MB (default: 5)
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function ImageUpload({
  bucket = 'cms-media',
  filePath = '',
  currentUrl = '',
  onUpload,
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif',
  maxSize = 5, // MB
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  /**
   * Handle file upload to Supabase Storage
   */
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file size
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > maxSize) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const fullPath = `${filePath}${fileName}`;

      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath);

      const publicUrl = urlData.publicUrl;
      setPreviewUrl(publicUrl);

      toast({
        title: '✅ Upload successful',
        description: 'Image has been uploaded.',
      });

      // Call parent callback
      if (onUpload) {
        onUpload(publicUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: '❌ Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  /**
   * Trigger file input click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Clear current image
   */
  const handleClear = () => {
    setPreviewUrl('');
    if (onUpload) {
      onUpload('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Current image preview */}
      {previewUrl && (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          cursor-pointer transition-all
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-300">Uploading...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                {previewUrl ? (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  JPG, PNG, WebP, SVG, GIF (max {maxSize}MB)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Progress bar */}
      {uploading && progress > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-gray-400">{progress}%</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
