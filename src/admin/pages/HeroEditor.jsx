/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HeroEditor Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing hero section content
 * - Badge text
 * - Headline & sub-headline
 * - CTA buttons (2)
 * - Background style
 * - Hero image
 * - Live preview
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import useCmsConfig from '@/admin/hooks/useCmsConfig';
import ImageUpload from '@/admin/components/cms/ImageUpload';
import HeroPreview from '@/admin/components/cms/HeroPreview';

const DEFAULT_HERO = {
  badge: 'AI-Powered Prompt Engineering',
  headline: 'Craft Perfect Prompts in Seconds',
  subHeadline: 'Generate high-quality, structured prompts for ChatGPT, Claude, Gemini, and more. From basic to advanced chain-of-thought — unlock AI\'s full potential.',
  cta1Label: 'Start Generating Free',
  cta1Url: '/auth?mode=signup',
  cta1Color: 'primary',
  cta2Label: 'See How It Works',
  cta2Url: '#features',
  cta2Color: 'outline',
  backgroundStyle: 'gradient',
  backgroundColor: '#0d0f1f',
  heroImageUrl: '',
};

export function HeroEditor() {
  const { data, loading, saving, save } = useCmsConfig('hero');
  const [formData, setFormData] = useState(DEFAULT_HERO);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData({ ...DEFAULT_HERO, ...data });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await save(formData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hero Editor</h1>
          <p className="text-gray-400 text-sm">
            Configure your homepage hero section
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700"
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

      {/* Form */}
      <div className="space-y-6">
        {/* Content Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Content
          </h3>

          {/* Badge */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Badge Text
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => handleChange('badge', e.target.value)}
              placeholder="🚀 Now with Chain-of-Thought Prompts"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Headline
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="Generate Perfect AI Prompts"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-lg font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Sub-headline */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Sub-headline
            </label>
            <textarea
              value={formData.subHeadline}
              onChange={(e) => handleChange('subHeadline', e.target.value)}
              placeholder="Transform your ideas into powerful AI prompts"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* CTA Buttons Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Call-to-Action Buttons
          </h3>

          {/* CTA Button 1 */}
          <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400">Primary Button</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-2">
                <label className="text-xs font-medium text-gray-400">Label</label>
                <input
                  type="text"
                  value={formData.cta1Label}
                  onChange={(e) => handleChange('cta1Label', e.target.value)}
                  placeholder="Get Started"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-xs font-medium text-gray-400">URL</label>
                <input
                  type="text"
                  value={formData.cta1Url}
                  onChange={(e) => handleChange('cta1Url', e.target.value)}
                  placeholder="/auth"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-xs font-medium text-gray-400">Style</label>
                <select
                  value={formData.cta1Color}
                  onChange={(e) => handleChange('cta1Color', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm"
                >
                  <option value="primary">Primary</option>
                  <option value="accent">Accent</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
            </div>
          </div>

          {/* CTA Button 2 */}
          <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400">Secondary Button</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-2">
                <label className="text-xs font-medium text-gray-400">Label</label>
                <input
                  type="text"
                  value={formData.cta2Label}
                  onChange={(e) => handleChange('cta2Label', e.target.value)}
                  placeholder="View Demo"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-xs font-medium text-gray-400">URL</label>
                <input
                  type="text"
                  value={formData.cta2Url}
                  onChange={(e) => handleChange('cta2Url', e.target.value)}
                  placeholder="/demo"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-xs font-medium text-gray-400">Style</label>
                <select
                  value={formData.cta2Color}
                  onChange={(e) => handleChange('cta2Color', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm"
                >
                  <option value="primary">Primary</option>
                  <option value="accent">Accent</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Background Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Background Style
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'gradient', label: 'Gradient' },
              { value: 'particles', label: 'Particles' },
              { value: 'mesh', label: 'Mesh' },
              { value: 'solid', label: 'Solid Color' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => handleChange('backgroundStyle', style.value)}
                className={`
                  px-4 py-3 rounded-lg border-2 transition-all
                  ${formData.backgroundStyle === style.value
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }
                `}
              >
                <div className="text-sm font-medium">{style.label}</div>
              </button>
            ))}
          </div>

          {formData.backgroundStyle === 'solid' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Background Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="h-12 w-16 rounded-lg cursor-pointer border border-gray-700 bg-gray-800"
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  placeholder="#000000"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hero Image Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Hero Image
          </h3>

          <ImageUpload
            bucket="cms-media"
            filePath="hero/"
            currentUrl={formData.heroImageUrl}
            onUpload={(url) => handleChange('heroImageUrl', url)}
          />
        </div>

        {/* Live Preview */}
        <HeroPreview heroData={formData} />
      </div>
    </div>
  );
}

export default HeroEditor;
