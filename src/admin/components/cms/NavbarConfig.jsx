/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NavbarConfig Sub-Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Navbar configuration tab
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import ImageUpload from '@/admin/components/cms/ImageUpload';
import DraggableList from '@/admin/components/cms/DraggableList';

export function NavbarConfig({ config, onChange }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  const handleLinksChange = (newLinks) => {
    handleFieldChange('navLinks', newLinks);
  };

  const addLink = () => {
    const newLink = {
      id: Date.now().toString(),
      label: 'New Link',
      url: '/',
      isExternal: false,
      isVisible: true,
    };
    handleFieldChange('navLinks', [...(config.navLinks || []), newLink]);
  };

  const updateLink = (id, field, value) => {
    const updated = config.navLinks.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    handleFieldChange('navLinks', updated);
  };

  const deleteLink = (id) => {
    handleFieldChange('navLinks', config.navLinks.filter((link) => link.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Logo & Brand */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Logo & Branding
        </h3>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Logo Image
          </label>
          <ImageUpload
            bucket="cms-media"
            filePath="brand/"
            currentUrl={config.logoUrl || ''}
            onUpload={(url) => handleFieldChange('logoUrl', url)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Site Name
          </label>
          <input
            type="text"
            value={config.siteName || ''}
            onChange={(e) => handleFieldChange('siteName', e.target.value)}
            placeholder="AskJai"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Tagline
          </label>
          <input
            type="text"
            value={config.tagline || ''}
            onChange={(e) => handleFieldChange('tagline', e.target.value)}
            placeholder="AI Prompt Generator"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Navigation Links
          </h3>
          <Button
            size="sm"
            onClick={addLink}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </Button>
        </div>

        <DraggableList
          items={config.navLinks || []}
          onReorder={handleLinksChange}
          emptyMessage="No navigation links yet"
          renderItem={(link, index, dragHandleProps) => (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
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

                {/* Fields */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                    placeholder="Label"
                    className="bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                    placeholder="/url"
                    className="bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-2 text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={link.isVisible}
                    onCheckedChange={(val) => updateLink(link.id, 'isVisible', val)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteLink(link.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* External link toggle */}
              <div className="flex items-center gap-2 pl-7">
                <Switch
                  checked={link.isExternal}
                  onCheckedChange={(val) => updateLink(link.id, 'isExternal', val)}
                />
                <label className="text-xs text-gray-400 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Open in new tab
                </label>
              </div>
            </div>
          )}
        />
      </div>

      {/* CTA Button */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          CTA Button
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Button Text
            </label>
            <input
              type="text"
              value={config.ctaText || ''}
              onChange={(e) => handleFieldChange('ctaText', e.target.value)}
              placeholder="Sign In"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Button URL
            </label>
            <input
              type="text"
              value={config.ctaUrl || ''}
              onChange={(e) => handleFieldChange('ctaUrl', e.target.value)}
              placeholder="/auth"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Button Style
          </label>
          <select
            value={config.ctaStyle || 'primary'}
            onChange={(e) => handleFieldChange('ctaStyle', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
          >
            <option value="primary">Primary (Filled)</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="text-sm font-medium text-gray-300">
            Show CTA Button
          </label>
          <Switch
            checked={config.ctaVisible ?? true}
            onCheckedChange={(val) => handleFieldChange('ctaVisible', val)}
          />
        </div>
      </div>

      {/* Navbar Behavior */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Behavior
        </h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <label className="text-sm font-medium text-gray-300">
              Sticky Navbar
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Navbar stays at top when scrolling
            </p>
          </div>
          <Switch
            checked={config.stickyNavbar ?? true}
            onCheckedChange={(val) => handleFieldChange('stickyNavbar', val)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <label className="text-sm font-medium text-gray-300">
              Transparent on Hero
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Transparent background on hero section
            </p>
          </div>
          <Switch
            checked={config.transparentOnHero ?? true}
            onCheckedChange={(val) => handleFieldChange('transparentOnHero', val)}
          />
        </div>
      </div>
    </div>
  );
}

export default NavbarConfig;
