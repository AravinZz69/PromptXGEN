/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FeaturesEditor Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing feature cards
 * - Drag-and-drop reordering
 * - Icon, title, description for each feature
 * - Badge with color
 * - Visibility toggle
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import useCmsConfig from '@/admin/hooks/useCmsConfig';
import DraggableList from '@/admin/components/cms/DraggableList';

// Default features matching frontend FeaturesSection.tsx
const DEFAULT_FEATURES = {
  features: [
    {
      id: '1',
      icon: 'Wand2',
      title: 'Smart Prompt Generation',
      description: 'Generate basic or advanced chain-of-thought prompts for any task — optimized for every major AI model.',
      badge: '',
      badgeColor: 'blue',
      isVisible: true,
    },
    {
      id: '2',
      icon: 'MessageSquare',
      title: 'AI ChatBox',
      description: 'A unique chat interface with conversation history, export options, and real-time streaming responses.',
      badge: '',
      badgeColor: 'purple',
      isVisible: true,
    },
    {
      id: '3',
      icon: 'Layers',
      title: 'Template Library',
      description: '20+ curated prompt templates across Marketing, SEO, Coding, Writing, and more. Use or customize.',
      badge: '',
      badgeColor: 'gray',
      isVisible: true,
    },
    {
      id: '4',
      icon: 'Zap',
      title: 'Content Generation',
      description: 'Generate blog posts, tweets, emails, and ad copy instantly. Copy to clipboard or save to history.',
      badge: '',
      badgeColor: 'blue',
      isVisible: true,
    },
    {
      id: '5',
      icon: 'Copy',
      title: 'Multi-Model Support',
      description: 'Target prompts for ChatGPT, Claude, Gemini, Midjourney, and more with optimized formatting.',
      badge: '',
      badgeColor: 'purple',
      isVisible: true,
    },
    {
      id: '6',
      icon: 'Shield',
      title: 'Credit System',
      description: 'Flexible credit-based usage with free tier. Subscribe for more or purchase credits on demand.',
      badge: '',
      badgeColor: 'gray',
      isVisible: true,
    },
  ],
};

export function FeaturesEditor() {
  const { data, loading, saving, save } = useCmsConfig('features');
  const [features, setFeatures] = useState(DEFAULT_FEATURES.features);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (data && data.features) {
      setFeatures(data.features);
    }
  }, [data]);

  const handleSave = async () => {
    await save({ features });
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      icon: '✨',
      title: 'New Feature',
      description: 'Describe your feature here',
      badge: '',
      badgeColor: 'blue',
      isVisible: true,
    };
    setFeatures([...features, newFeature]);
  };

  const updateFeature = (id, field, value) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const deleteFeature = (id) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Features Editor</h1>
          <p className="text-muted-foreground text-sm">
            Manage your website's feature cards
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={addFeature}
            variant="outline"
            className="border-border text-muted-foreground hover:bg-muted gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Features list */}
      <div className="bg-muted border border-border rounded-xl p-6">
        <DraggableList
          items={features}
          onReorder={setFeatures}
          emptyMessage="No features yet. Click 'Add Feature' to create one."
          renderItem={(feature, index, dragHandleProps) => (
            <div className="bg-muted border border-border rounded-lg p-5 space-y-4">
              {/* Header row */}
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <div {...dragHandleProps} className="pt-2">
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Icon */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Icon</label>
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                    placeholder="✨"
                    className="w-16 text-center bg-muted border border-border text-white text-2xl rounded px-2 py-2"
                  />
                </div>

                {/* Title & Description */}
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                    placeholder="Feature Title"
                    className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded px-3 py-2 font-semibold"
                  />
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                    placeholder="Feature description..."
                    rows={2}
                    className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded px-3 py-2 text-sm resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Visible</span>
                    <Switch
                      checked={feature.isVisible}
                      onCheckedChange={(val) => updateFeature(feature.id, 'isVisible', val)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(feature.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Badge row */}
              <div className="flex items-center gap-3 pl-10">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Badge Text</label>
                    <input
                      type="text"
                      value={feature.badge}
                      onChange={(e) => updateFeature(feature.id, 'badge', e.target.value)}
                      placeholder="New / Popular"
                      className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Badge Color</label>
                    <select
                      value={feature.badgeColor}
                      onChange={(e) => updateFeature(feature.id, 'badgeColor', e.target.value)}
                      className="w-full bg-muted border border-border text-white rounded px-3 py-1.5 text-sm"
                    >
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="red">Red</option>
                      <option value="gray">Gray</option>
                    </select>
                  </div>
                </div>

                {/* Badge preview */}
                {feature.badge && (
                  <div className="pt-5">
                    <span
                      className={`
                        inline-block px-2 py-0.5 text-xs font-medium rounded
                        ${feature.badgeColor === 'blue' && 'bg-blue-500/20 text-blue-400'}
                        ${feature.badgeColor === 'purple' && 'bg-purple-500/20 text-purple-400'}
                        ${feature.badgeColor === 'green' && 'bg-green-500/20 text-green-400'}
                        ${feature.badgeColor === 'yellow' && 'bg-yellow-500/20 text-yellow-400'}
                        ${feature.badgeColor === 'red' && 'bg-red-500/20 text-red-400'}
                        ${feature.badgeColor === 'gray' && 'bg-gray-500/20 text-muted-foreground'}
                      `}
                    >
                      {feature.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-muted border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Feature?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove this feature. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFeature(deleteId)}
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

export default FeaturesEditor;
