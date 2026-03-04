import React, { useState } from 'react';
import {
  Search,
  Filter,
  Flag,
  Trash2,
  Eye,
  Plus,
  Copy,
  Edit,
  Star,
  Save,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { mockPrompts, mockTemplates } from '../mockData';

const categoryOptions = ['All', 'Coding', 'Marketing', 'Creative Writing', 'Business', 'Research', 'Other'];
const modelOptions = ['All', 'GPT-4o', 'GPT-3.5 Turbo', 'Claude 3.5 Sonnet', 'Claude 3 Haiku'];

// MOCK DATA - Plan Prompt Limits
const planLimits = [
  { plan: 'Free', limit: 50, avgUsage: 32 },
  { plan: 'Pro', limit: 500, avgUsage: 287 },
  { plan: 'Enterprise', limit: 'Unlimited', avgUsage: 1456 },
];

export default function PromptManagement() {
  const [activeTab, setActiveTab] = useState('generated');
  const [prompts, setPrompts] = useState(mockPrompts);
  const [templates, setTemplates] = useState(mockTemplates);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modelFilter, setModelFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals
  const [viewPrompt, setViewPrompt] = useState(null);
  const [editTemplate, setEditTemplate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [limits, setLimits] = useState(planLimits);

  const pageSize = 10;

  // Filter prompts
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.input.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || prompt.category === categoryFilter;
    const matchesModel = modelFilter === 'All' || prompt.model === modelFilter;
    return matchesSearch && matchesCategory && matchesModel;
  });

  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredPrompts.length / pageSize);

  const handleFlag = (promptId) => {
    setPrompts(prompts.map(p => 
      p.id === promptId ? { ...p, status: p.status === 'Flagged' ? 'Completed' : 'Flagged' } : p
    ));
  };

  const handleDeletePrompt = (promptId) => {
    setPrompts(prompts.filter(p => p.id !== promptId));
    setConfirmDelete(null);
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    setConfirmDelete(null);
  };

  const handleSaveTemplate = (template) => {
    if (template.id) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([...templates, { ...template, id: templates.length + 1, timesUsed: 0, lastEdited: new Date().toISOString() }]);
    }
    setEditTemplate(null);
  };

  const handleDuplicate = (template) => {
    const newTemplate = {
      ...template,
      id: templates.length + 1,
      name: `${template.name} (Copy)`,
      timesUsed: 0,
      lastEdited: new Date().toISOString(),
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('generated')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'generated'
              ? 'text-indigo-400 border-indigo-500'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Generated Prompts
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'text-indigo-400 border-indigo-500'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          System Templates
        </button>
      </div>

      {/* Generated Prompts Tab */}
      {activeTab === 'generated' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'All' ? 'All Categories' : opt}</option>
              ))}
            </select>

            <select
              value={modelFilter}
              onChange={(e) => { setModelFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-[#111827] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {modelOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'All' ? 'All Models' : opt}</option>
              ))}
            </select>
          </div>

          {/* Prompts Table */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tokens</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPrompts.map(prompt => (
                    <tr key={prompt.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-sm text-gray-500">#{prompt.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{prompt.userEmail}</td>
                      <td className="px-4 py-3">
                        <Badge label={prompt.category} variant="purple" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{prompt.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {prompt.inputTokens} / {prompt.outputTokens}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{prompt.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          label={prompt.status} 
                          variant={prompt.status === 'Flagged' ? 'danger' : 'success'} 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewPrompt(prompt)}
                            className="p-1 text-gray-400 hover:text-white"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFlag(prompt.id)}
                            className={`p-1 ${prompt.status === 'Flagged' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ type: 'prompt', id: prompt.id })}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* System Templates Tab */}
      {activeTab === 'templates' && (
        <>
          {/* Header */}
          <div className="flex justify-end">
            <button
              onClick={() => setEditTemplate({ name: '', category: 'Coding', description: '', template: '', variables: [] })}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm text-white"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map(template => (
              <div key={template.id} className="bg-[#111827] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-medium">{template.name}</h3>
                  <Badge label={template.category} variant="purple" />
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Used {template.timesUsed.toLocaleString()} times</span>
                  <span>Edited {new Date(template.lastEdited).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 hover:text-white text-sm"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 hover:text-white text-sm"
                  >
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ type: 'template', id: template.id })}
                    className="p-2 bg-gray-800 text-gray-400 rounded hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Plan Limits Section */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Per-Plan Prompt Limits</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Monthly Limit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Avg Usage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {limits.map((item, i) => (
                <tr key={item.plan} className="border-b border-gray-800/50">
                  <td className="px-4 py-3">
                    <Badge label={item.plan} variant={item.plan === 'Free' ? 'neutral' : item.plan === 'Pro' ? 'purple' : 'success'} />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.limit}
                      onChange={(e) => {
                        const newLimits = [...limits];
                        newLimits[i].limit = e.target.value;
                        setLimits(newLimits);
                      }}
                      className="px-3 py-1 bg-[#0A0E1A] border border-gray-700 rounded text-white text-sm w-32 focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{item.avgUsage} prompts/mo</td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => console.log('Saving limits:', limits)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm text-white"
          >
            <Save className="w-4 h-4" />
            Save Limits
          </button>
        </div>
      </div>

      {/* View Prompt Modal */}
      <Modal isOpen={!!viewPrompt} onClose={() => setViewPrompt(null)} title="Prompt Details" size="2xl">
        {viewPrompt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Model:</span>
                <span className="ml-2 text-white">{viewPrompt.model}</span>
              </div>
              <div>
                <span className="text-gray-400">Tokens:</span>
                <span className="ml-2 text-white">{viewPrompt.inputTokens} in / {viewPrompt.outputTokens} out</span>
              </div>
              <div>
                <span className="text-gray-400">User:</span>
                <span className="ml-2 text-white">{viewPrompt.userEmail}</span>
              </div>
              <div>
                <span className="text-gray-400">Created:</span>
                <span className="ml-2 text-white">{new Date(viewPrompt.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Input</h4>
              <div className="p-4 bg-[#0A0E1A] rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm text-white whitespace-pre-wrap">{viewPrompt.input}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Output</h4>
              <div className="p-4 bg-[#0A0E1A] rounded-lg max-h-60 overflow-y-auto">
                <p className="text-sm text-white whitespace-pre-wrap">{viewPrompt.output}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { handleFlag(viewPrompt.id); setViewPrompt(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  viewPrompt.status === 'Flagged' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                <Flag className="w-4 h-4" />
                {viewPrompt.status === 'Flagged' ? 'Unflag' : 'Flag'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Template Modal */}
      <Modal isOpen={!!editTemplate} onClose={() => setEditTemplate(null)} title={editTemplate?.id ? 'Edit Template' : 'New Template'} size="2xl">
        {editTemplate && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Template Name</label>
              <input
                type="text"
                value={editTemplate.name}
                onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="e.g., Code Review Assistant"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={editTemplate.category}
                onChange={(e) => setEditTemplate({ ...editTemplate, category: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                {categoryOptions.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <input
                type="text"
                value={editTemplate.description}
                onChange={(e) => setEditTemplate({ ...editTemplate, description: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="Brief description of what this template does"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Template Text</label>
              <textarea
                value={editTemplate.template}
                onChange={(e) => setEditTemplate({ ...editTemplate, template: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                placeholder="Use {variable_name} for dynamic variables"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Variables (comma-separated)</label>
              <input
                type="text"
                value={editTemplate.variables?.join(', ') || ''}
                onChange={(e) => setEditTemplate({ ...editTemplate, variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="e.g., code, language, focus_areas"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditTemplate(null)}
                className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveTemplate(editTemplate)}
                className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Save Template
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete?.type === 'prompt') handleDeletePrompt(confirmDelete.id);
          else if (confirmDelete?.type === 'template') handleDeleteTemplate(confirmDelete.id);
        }}
        title={`Delete ${confirmDelete?.type === 'prompt' ? 'Prompt' : 'Template'}`}
        message={`Are you sure you want to delete this ${confirmDelete?.type}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
