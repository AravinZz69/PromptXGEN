/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FAQEditor Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing FAQ items
 * - Category filter tabs (All, General, Pricing, Technical, Account)
 * - Drag-and-drop reordering
 * - Question & answer fields
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

const CATEGORIES = ['All', 'General', 'Pricing', 'Technical', 'Security', 'Billing', 'Support'];

// Default FAQs matching frontend faqData.ts
const DEFAULT_FAQS = {
  faqs: [
    {
      id: '1',
      question: 'What is AskJai and how does it work?',
      answer: 'AskJai is an AI-powered prompt engineering platform that helps you create, optimize, and manage prompts for any AI model. Simply describe what you want to achieve, select your target AI model and use case, and our optimization engine generates highly effective prompts tailored to your needs.',
      category: 'General',
      isVisible: true,
    },
    {
      id: '2',
      question: 'Which AI models does AskJai support?',
      answer: 'AskJai works with all major AI models including GPT-4, GPT-3.5, Claude (all versions), Gemini, LLaMA, Mistral, and many more. Our prompt optimization adapts to each model\'s unique characteristics and capabilities.',
      category: 'General',
      isVisible: true,
    },
    {
      id: '3',
      question: 'How is pricing calculated?',
      answer: 'We offer flexible pricing based on usage. The Free tier includes 50 prompt generations per month. Pro ($19/month) includes 500 generations plus advanced features like prompt history and analytics. Team ($49/month) adds collaboration features for up to 5 users.',
      category: 'Pricing',
      isVisible: true,
    },
    {
      id: '4',
      question: 'Can I try AskJai before purchasing?',
      answer: 'Absolutely! We offer a generous free tier with 50 prompt generations per month—no credit card required. This gives you plenty of room to explore our features. Pro and Team plans also come with a 14-day money-back guarantee.',
      category: 'Pricing',
      isVisible: true,
    },
    {
      id: '5',
      question: 'Is my data secure and private?',
      answer: 'Security is our top priority. We use enterprise-grade encryption for all data at rest and in transit. Your prompts and outputs are never used to train AI models or shared with third parties.',
      category: 'Security',
      isVisible: true,
    },
    {
      id: '6',
      question: 'Do you offer an API for developers?',
      answer: 'Yes! Our API is available for Pro and Enterprise customers. You can generate optimized prompts programmatically and integrate AskJai into your existing workflows, applications, or CI/CD pipelines.',
      category: 'Technical',
      isVisible: true,
    },
    {
      id: '7',
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings—no need to contact support. When you cancel, you\'ll retain access to Pro features until the end of your billing period.',
      category: 'Billing',
      isVisible: true,
    },
    {
      id: '8',
      question: 'What kind of support do you offer?',
      answer: 'All users have access to our comprehensive documentation, video tutorials, and community forum. Pro users get priority email support with 24-hour response times. Team and Enterprise customers receive dedicated support.',
      category: 'Support',
      isVisible: true,
    },
  ],
};

export function FAQEditor() {
  const { data, loading, saving, save } = useCmsConfig('faq');
  const [faqs, setFaqs] = useState(DEFAULT_FAQS.faqs);
  const [activeCategory, setActiveCategory] = useState('All');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (data && data.faqs) {
      setFaqs(data.faqs);
    }
  }, [data]);

  const filteredFaqs = activeCategory === 'All'
    ? faqs
    : faqs.filter((faq) => faq.category === activeCategory);

  const handleSave = async () => {
    await save({ faqs });
  };

  const addFAQ = () => {
    const newFAQ = {
      id: Date.now().toString(),
      question: 'New question?',
      answer: 'Answer here...',
      category: activeCategory === 'All' ? 'General' : activeCategory,
      isVisible: true,
    };
    setFaqs([newFAQ, ...faqs]);
  };

  const updateFAQ = (id, field, value) => {
    setFaqs((prev) =>
      prev.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq))
    );
  };

  const deleteFAQ = (id) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
    setDeleteId(null);
  };

  const reorderFAQs = (reordered) => {
    // Merge reordered items with items from other categories
    const otherCategoryItems = faqs.filter(
      (faq) => activeCategory !== 'All' && faq.category !== activeCategory
    );
    setFaqs([...reordered, ...otherCategoryItems]);
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
          <h1 className="text-2xl font-bold text-white">FAQ Editor</h1>
          <p className="text-gray-400 text-sm">
            Manage your frequently asked questions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={addFAQ}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
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

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
          >
            {category}
            <span className="ml-2 text-xs opacity-70">
              ({category === 'All' ? faqs.length : faqs.filter(f => f.category === category).length})
            </span>
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <DraggableList
          items={filteredFaqs}
          onReorder={reorderFAQs}
          emptyMessage="No FAQs in this category yet. Click 'Add FAQ' to create one."
          renderItem={(faq, index, dragHandleProps) => (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 space-y-4">
              {/* Header row */}
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <div {...dragHandleProps} className="pt-3">
                  <GripVertical className="w-5 h-5 text-gray-500" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Question */}
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                    placeholder="Question?"
                    className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 font-semibold"
                  />

                  {/* Answer */}
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                    placeholder="Answer..."
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm resize-none"
                  />

                  {/* Category */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-400">Category:</label>
                    <select
                      value={faq.category}
                      onChange={(e) => updateFAQ(faq.id, 'category', e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-white rounded px-3 py-1.5 text-sm"
                    >
                      <option value="General">General</option>
                      <option value="Pricing">Pricing</option>
                      <option value="Technical">Technical</option>
                      <option value="Account">Account</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Visible</span>
                    <Switch
                      checked={faq.isVisible}
                      onCheckedChange={(val) => updateFAQ(faq.id, 'isVisible', val)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(faq.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently remove this FAQ item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFAQ(deleteId)}
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

export default FAQEditor;
