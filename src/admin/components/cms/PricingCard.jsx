/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PricingCard Sub-Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Individual pricing plan card editor
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import DraggableList from './DraggableList';

export function PricingCard({ plan, onChange, showAnnual }) {
  const updateField = (field, value) => {
    onChange({ ...plan, [field]: value });
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      text: 'New feature',
    };
    updateField('features', [...(plan.features || []), newFeature]);
  };

  const updateFeature = (id, text) => {
    const updated = plan.features.map((f) =>
      f.id === id ? { ...f, text } : f
    );
    updateField('features', updated);
  };

  const deleteFeature = (id) => {
    updateField('features', plan.features.filter((f) => f.id !== id));
  };

  const reorderFeatures = (newFeatures) => {
    updateField('features', newFeatures);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5 relative">
      {/* Popular badge indicator */}
      {plan.isPopular && (
        <div className="absolute top-0 right-6 -translate-y-1/2">
          <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
            {plan.badgeText || 'Most Popular'}
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">Plan Name</label>
        <input
          type="text"
          value={plan.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Pro"
          className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 font-semibold"
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Monthly Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={plan.monthlyPrice}
              onChange={(e) => updateField('monthlyPrice', e.target.value)}
              placeholder="29"
              className="w-full pl-7 pr-3 py-2 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Annual Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={plan.annualPrice}
              onChange={(e) => updateField('annualPrice', e.target.value)}
              placeholder="290"
              className="w-full pl-7 pr-3 py-2 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">Description</label>
        <textarea
          value={plan.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Perfect for professionals"
          rows={2}
          className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm resize-none"
        />
      </div>

      {/* CTA Button */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">CTA Button Text</label>
        <input
          type="text"
          value={plan.ctaText}
          onChange={(e) => updateField('ctaText', e.target.value)}
          placeholder="Get Started"
          className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2"
        />
      </div>

      {/* Features */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-400">Features</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addFeature}
            className="h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {(plan.features || []).map((feature) => (
            <div key={feature.id} className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">✓</span>
              <input
                type="text"
                value={feature.text}
                onChange={(e) => updateFeature(feature.id, e.target.value)}
                placeholder="Feature item"
                className="flex-1 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded px-2 py-1.5 text-sm"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteFeature(feature.id)}
                className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="pt-4 border-t border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-400">Mark as Popular</label>
          <Switch
            checked={plan.isPopular}
            onCheckedChange={(val) => updateField('isPopular', val)}
          />
        </div>

        {plan.isPopular && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Badge Text</label>
            <input
              type="text"
              value={plan.badgeText}
              onChange={(e) => updateField('badgeText', e.target.value)}
              placeholder="Most Popular"
              className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded px-3 py-1.5 text-sm"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-400">Show Plan</label>
          <Switch
            checked={plan.isVisible}
            onCheckedChange={(val) => updateField('isVisible', val)}
          />
        </div>
      </div>
    </div>
  );
}

export default PricingCard;
