/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemeManager Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing global theme settings
 * - Color palette (primary, accent, background, text, button)
 * - Typography (heading/body fonts, base size)
 * - Style (border radius, dark mode, custom cursor)
 * - Live preview panel
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import useCmsConfig from '@/admin/hooks/useCmsConfig';
import ColorPicker from '@/admin/components/cms/ColorPicker';
import ThemePreview from '@/admin/components/cms/ThemePreview';

// Default theme values
const DEFAULT_THEME = {
  primaryColor: '#6366f1',
  accentColor: '#a855f7',
  backgroundColor: '#0d0f1f',
  textColor: '#ffffff',
  buttonColor: '#6366f1',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  baseFontSize: '16px',
  borderRadius: 'rounded',
  darkModeDefault: true,
  showCustomCursor: true,
};

export function ThemeManager() {
  const { data, loading, saving, save } = useCmsConfig('theme');
  const [formData, setFormData] = useState(DEFAULT_THEME);

  // Load data from CMS config
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData({ ...DEFAULT_THEME, ...data });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await save(formData);
  };

  const handleReset = () => {
    setFormData(DEFAULT_THEME);
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
          <h1 className="text-2xl font-bold text-white">Theme Manager</h1>
          <p className="text-gray-400 text-sm">
            Customize your website's appearance and branding
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Reset to Defaults
          </Button>
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
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel - Settings (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* COLOR PALETTE Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Color Palette
            </h3>

            <ColorPicker
              label="Primary / Brand Color"
              value={formData.primaryColor}
              onChange={(val) => handleChange('primaryColor', val)}
            />

            <ColorPicker
              label="Accent / Highlight Color"
              value={formData.accentColor}
              onChange={(val) => handleChange('accentColor', val)}
            />

            <ColorPicker
              label="Background Color"
              value={formData.backgroundColor}
              onChange={(val) => handleChange('backgroundColor', val)}
            />

            <ColorPicker
              label="Text Color"
              value={formData.textColor}
              onChange={(val) => handleChange('textColor', val)}
            />

            <ColorPicker
              label="Button Color"
              value={formData.buttonColor}
              onChange={(val) => handleChange('buttonColor', val)}
            />
          </div>

          {/* TYPOGRAPHY Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Typography
            </h3>

            {/* Heading Font */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Heading Font
              </label>
              <select
                value={formData.headingFont}
                onChange={(e) => handleChange('headingFont', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Inter">Inter</option>
                <option value="Syne">Syne</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Raleway">Raleway</option>
                <option value="Space Grotesk">Space Grotesk</option>
              </select>
            </div>

            {/* Body Font */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Body Font
              </label>
              <select
                value={formData.bodyFont}
                onChange={(e) => handleChange('bodyFont', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Inter">Inter</option>
                <option value="Syne">Syne</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Raleway">Raleway</option>
                <option value="Space Grotesk">Space Grotesk</option>
              </select>
            </div>

            {/* Base Font Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Base Font Size
              </label>
              <select
                value={formData.baseFontSize}
                onChange={(e) => handleChange('baseFontSize', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="14px">14px - Small</option>
                <option value="15px">15px - Compact</option>
                <option value="16px">16px - Default</option>
                <option value="18px">18px - Large</option>
              </select>
            </div>
          </div>

          {/* STYLE Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Style
            </h3>

            {/* Border Radius */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Border Radius
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['sharp', 'rounded', 'pill'].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => handleChange('borderRadius', radius)}
                    className={`
                      px-4 py-3 rounded-lg border-2 transition-all
                      ${formData.borderRadius === radius
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="text-sm font-medium capitalize">{radius}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {radius === 'sharp' && '0px'}
                      {radius === 'rounded' && '8px'}
                      {radius === 'pill' && 'Full'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Default */}
            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Dark Mode Default
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable dark mode by default for new users
                </p>
              </div>
              <Switch
                checked={formData.darkModeDefault}
                onCheckedChange={(val) => handleChange('darkModeDefault', val)}
              />
            </div>

            {/* Custom Cursor */}
            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Show Custom Cursor
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable animated custom cursor effect
                </p>
              </div>
              <Switch
                checked={formData.showCustomCursor}
                onCheckedChange={(val) => handleChange('showCustomCursor', val)}
              />
            </div>
          </div>
        </div>

        {/* Right panel - Live Preview (1/3 width) */}
        <div className="lg:col-span-1">
          <ThemePreview themeData={formData} />
        </div>
      </div>
    </div>
  );
}

export default ThemeManager;
