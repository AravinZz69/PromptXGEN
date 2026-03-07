/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FooterConfig Sub-Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Footer configuration tab
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Twitter, Linkedin, Github, Instagram, Youtube } from 'lucide-react';
import ImageUpload from '@/admin/components/cms/ImageUpload';
import DraggableList from '@/admin/components/cms/DraggableList';

const SOCIAL_PLATFORMS = [
  { key: 'twitter', label: 'Twitter / X', icon: Twitter },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'youtube', label: 'YouTube', icon: Youtube },
];

export function FooterConfig({ config, onChange }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  const handleSocialChange = (platform, field, value) => {
    const social = { ...(config.social || {}), [platform]: { ...(config.social?.[platform] || {}), [field]: value } };
    handleFieldChange('social', social);
  };

  const addColumn = () => {
    const newColumn = {
      id: Date.now().toString(),
      title: 'New Section',
      links: [],
    };
    handleFieldChange('columns', [...(config.columns || []), newColumn]);
  };

  const updateColumn = (id, field, value) => {
    const updated = config.columns.map((col) =>
      col.id === id ? { ...col, [field]: value } : col
    );
    handleFieldChange('columns', updated);
  };

  const deleteColumn = (id) => {
    handleFieldChange('columns', config.columns.filter((col) => col.id !== id));
  };

  const addLinkToColumn = (columnId) => {
    const updated = config.columns.map((col) => {
      if (col.id === columnId) {
        return {
          ...col,
          links: [...(col.links || []), { id: Date.now().toString(), label: 'New Link', url: '/' }],
        };
      }
      return col;
    });
    handleFieldChange('columns', updated);
  };

  const updateColumnLink = (columnId, linkId, field, value) => {
    const updated = config.columns.map((col) => {
      if (col.id === columnId) {
        return {
          ...col,
          links: col.links.map((link) =>
            link.id === linkId ? { ...link, [field]: value } : link
          ),
        };
      }
      return col;
    });
    handleFieldChange('columns', updated);
  };

  const deleteColumnLink = (columnId, linkId) => {
    const updated = config.columns.map((col) => {
      if (col.id === columnId) {
        return {
          ...col,
          links: col.links.filter((link) => link.id !== linkId),
        };
      }
      return col;
    });
    handleFieldChange('columns', updated);
  };

  return (
    <div className="space-y-6">
      {/* Logo & Tagline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Footer Branding
        </h3>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Footer Logo
          </label>
          <ImageUpload
            bucket="cms-media"
            filePath="brand/"
            currentUrl={config.footerLogoUrl || ''}
            onUpload={(url) => handleFieldChange('footerLogoUrl', url)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Tagline / Description
          </label>
          <textarea
            value={config.footerTagline || ''}
            onChange={(e) => handleFieldChange('footerTagline', e.target.value)}
            placeholder="Your AI-powered prompt generator"
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Social Links
        </h3>

        <div className="space-y-4">
          {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={config.social?.[key]?.url || ''}
                  onChange={(e) => handleSocialChange(key, 'url', e.target.value)}
                  placeholder={`${label} URL`}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <Switch
                checked={config.social?.[key]?.visible ?? false}
                onCheckedChange={(val) => handleSocialChange(key, 'visible', val)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Columns */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Footer Columns
          </h3>
          <Button
            size="sm"
            onClick={addColumn}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Column
          </Button>
        </div>

        <DraggableList
          items={config.columns || []}
          onReorder={(newCols) => handleFieldChange('columns', newCols)}
          emptyMessage="No footer columns yet"
          renderItem={(column, index, dragHandleProps) => (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
              {/* Column header */}
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <div {...dragHandleProps} className="pt-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-500">
                    <circle cx="4" cy="4" r="1.5" />
                    <circle cx="12" cy="4" r="1.5" />
                    <circle cx="4" cy="8" r="1.5" />
                    <circle cx="12" cy="8" r="1.5" />
                    <circle cx="4" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                  </svg>
                </div>

                {/* Column title */}
                <input
                  type="text"
                  value={column.title}
                  onChange={(e) => updateColumn(column.id, 'title', e.target.value)}
                  placeholder="Column Title"
                  className="flex-1 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-2 text-sm font-medium"
                />

                {/* Delete column */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteColumn(column.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Column links */}
              <div className="pl-7 space-y-2">
                {(column.links || []).map((link) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateColumnLink(column.id, link.id, 'label', e.target.value)}
                      placeholder="Label"
                      className="flex-1 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded px-2 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateColumnLink(column.id, link.id, 'url', e.target.value)}
                      placeholder="/url"
                      className="flex-1 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded px-2 py-1.5 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteColumnLink(column.id, link.id)}
                      className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addLinkToColumn(column.id)}
                  className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 gap-2 h-8"
                >
                  <Plus className="w-3 h-3" />
                  Add Link
                </Button>
              </div>
            </div>
          )}
        />
      </div>

      {/* Copyright & Newsletter */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Additional Settings
        </h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Copyright Text
          </label>
          <input
            type="text"
            value={config.copyrightText || ''}
            onChange={(e) => handleFieldChange('copyrightText', e.target.value)}
            placeholder="© 2025 AskJai. All rights reserved."
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <label className="text-sm font-medium text-gray-300">
              Show Newsletter Signup
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Display newsletter subscription form in footer
            </p>
          </div>
          <Switch
            checked={config.showNewsletter ?? false}
            onCheckedChange={(val) => handleFieldChange('showNewsletter', val)}
          />
        </div>

        {config.showNewsletter && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Newsletter Placeholder
            </label>
            <input
              type="text"
              value={config.newsletterPlaceholder || ''}
              onChange={(e) => handleFieldChange('newsletterPlaceholder', e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FooterConfig;
