/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PricingEditor Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing pricing plans
 * - 3 plan columns (Free, Pro, Enterprise)
 * - Monthly/Annual pricing toggle
 * - Features list per plan
 * - Popular badge
 * - Live preview
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import useCmsConfig from '@/admin/hooks/useCmsConfig';
import PricingCard from '@/admin/components/cms/PricingCard';

// Default pricing matching frontend PricingSection.tsx
const DEFAULT_PRICING = {
  billingToggle: true,
  plans: [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: '0',
      annualPrice: '0',
      description: '10 credits/month',
      ctaText: 'Get Started',
      isPopular: false,
      badgeText: '',
      isVisible: true,
      features: [
        { id: '1', text: '10 credits/month' },
        { id: '2', text: '5 templates' },
        { id: '3', text: 'Basic prompt generation' },
        { id: '4', text: 'Limited ChatBox' },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: '19',
      annualPrice: '190',
      description: '200 credits/month',
      ctaText: 'Upgrade to Pro',
      isPopular: true,
      badgeText: 'Most Popular',
      isVisible: true,
      features: [
        { id: '1', text: '200 credits/month' },
        { id: '2', text: 'All templates' },
        { id: '3', text: 'Advanced prompts' },
        { id: '4', text: 'Full ChatBox' },
        { id: '5', text: 'Priority support' },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: '49',
      annualPrice: '490',
      description: 'Unlimited credits',
      ctaText: 'Contact Sales',
      isPopular: false,
      badgeText: 'Best Value',
      isVisible: true,
      features: [
        { id: '1', text: 'Unlimited credits' },
        { id: '2', text: 'All + custom templates' },
        { id: '3', text: 'Advanced prompts' },
        { id: '4', text: 'Full ChatBox' },
        { id: '5', text: 'Priority support' },
        { id: '6', text: 'Custom integrations' },
      ],
    },
  ],
};

export function PricingEditor() {
  const { data, loading, saving, save } = useCmsConfig('pricing');
  const [config, setConfig] = useState(DEFAULT_PRICING);
  const [previewMode, setPreviewMode] = useState('monthly');

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setConfig({ ...DEFAULT_PRICING, ...data });
    }
  }, [data]);

  const handleSave = async () => {
    await save(config);
  };

  const updatePlan = (planId, updatedPlan) => {
    setConfig((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === planId ? updatedPlan : p)),
    }));
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
          <h1 className="text-2xl font-bold text-white">Pricing Editor</h1>
          <p className="text-gray-400 text-sm">
            Manage your pricing plans and features
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

      {/* Billing toggle setting */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-300">
              Enable Billing Toggle
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Allow users to switch between monthly and annual pricing
            </p>
          </div>
          <Button
            variant={config.billingToggle ? 'default' : 'outline'}
            onClick={() => setConfig({ ...config, billingToggle: !config.billingToggle })}
            className={config.billingToggle ? 'bg-indigo-600' : 'border-gray-700 text-gray-400'}
          >
            {config.billingToggle ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </div>

      {/* Preview mode toggle */}
      {config.billingToggle && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-gray-400">Preview Mode:</span>
          <div className="inline-flex bg-gray-900 border border-gray-800 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('monthly')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                previewMode === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPreviewMode('annual')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                previewMode === 'annual'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            onChange={(updated) => updatePlan(plan.id, updated)}
            showAnnual={previewMode === 'annual'}
          />
        ))}
      </div>

      {/* Live Preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2">Pricing Section Preview</span>
        </div>

        <div className="p-8 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
            <p className="text-gray-400">Select the perfect plan for your needs</p>
          </div>

          {config.billingToggle && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-sm text-gray-400">Monthly</span>
              <div className="inline-flex bg-gray-800 border border-gray-700 rounded-lg p-1">
                <div className="w-12 h-6 bg-indigo-600 rounded transition-transform" />
              </div>
              <span className="text-sm text-gray-400">
                Annual <span className="text-green-400 text-xs ml-1">(Save 17%)</span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {config.plans.filter(p => p.isVisible).map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gray-800/50 backdrop-blur border rounded-xl p-6 ${
                  plan.isPopular ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-700'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-6 -translate-y-1/2">
                    <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                      {plan.badgeText}
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${previewMode === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    / {previewMode === 'annual' ? 'year' : 'month'}
                  </span>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-medium mb-6 transition-colors ${
                    plan.isPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {plan.ctaText}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2 text-sm">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-gray-300">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingEditor;
