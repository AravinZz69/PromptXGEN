import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { supabase } from '../../lib/supabase';

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
  const [prompts, setPrompts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // Fetch prompts and templates from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // Try admin RPC function first
      const { data: adminPromptData, error: adminError } = await supabase.rpc('get_all_prompts_admin');
      
      let promptData = [];
      let profileMap = {};

      if (!adminError && adminPromptData && adminPromptData.length > 0) {
        console.log('Fetched prompts via admin function:', adminPromptData.length);
        promptData = adminPromptData;
      } else {
        if (adminError) console.log('Admin function not available, using fallback:', adminError.message);
        
        // Fallback: Fetch prompt_history directly
        const { data: fallbackData, error: promptError } = await supabase
          .from('prompt_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);

        if (promptError) {
          console.error('Error fetching prompts:', promptError);
        }

        // Fetch all profiles for user lookup
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name');

        (profilesData || []).forEach(p => {
          profileMap[p.id] = p;
        });

        promptData = fallbackData || [];
      }

      // Map to expected format
      const mappedPrompts = (promptData || []).map(p => {
        const profile = profileMap[p.user_id] || {};
        return {
          id: p.id,
          userId: p.user_id,
          userEmail: p.user_email || profile.email || 'Unknown',
          userName: p.user_name || profile.full_name || 'Unknown',
          input: p.input_text || p.prompt_text || p.prompt || '',
          output: p.output_text || p.ai_response || p.response || '',
          category: p.prompt_type || p.category || 'basic',
          model: p.model || 'groq',
          status: p.metadata?.flagged ? 'Flagged' : 'Completed',
          createdAt: p.created_at,
          tokens: p.tokens_used || p.metadata?.tokens || 0,
          creditsUsed: p.credits_used || 1,
        };
      });

      setPrompts(mappedPrompts);
      console.log('Total prompts loaded:', mappedPrompts.length);

      // Fetch templates (if table exists)
      const { data: templateData, error: templateError } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (!templateError && templateData) {
        const mappedTemplates = templateData.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category || 'Other',
          description: t.description || '',
          template: t.template_text || '',
          isFeatured: t.is_featured || false,
          timesUsed: t.times_used || 0,
          lastEdited: t.updated_at || t.created_at,
        }));
        setTemplates(mappedTemplates);
      }
    } catch (error) {
      console.error('Error fetching prompt data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleFlag = async (promptId) => {
    const prompt = prompts.find(p => p.id === promptId);
    const newFlaggedState = prompt?.status !== 'Flagged';
    
    try {
      const { error } = await supabase
        .from('prompt_history')
        .update({ 
          metadata: { flagged: newFlaggedState }
        })
        .eq('id', promptId);

      if (error) throw error;

      setPrompts(prompts.map(p => 
        p.id === promptId ? { ...p, status: newFlaggedState ? 'Flagged' : 'Completed' } : p
      ));
    } catch (error) {
      console.error('Error flagging prompt:', error);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      const { error } = await supabase
        .from('prompt_history')
        .delete()
        .eq('id', promptId);

      if (error) throw error;

      setPrompts(prompts.filter(p => p.id !== promptId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleSaveTemplate = async (template) => {
    try {
      if (template.id) {
        // Update existing
        const { error } = await supabase
          .from('prompt_templates')
          .update({
            name: template.name,
            category: template.category,
            description: template.description,
            template_text: template.template,
            is_featured: template.isFeatured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id);

        if (error) throw error;

        setTemplates(templates.map(t => t.id === template.id ? template : t));
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('prompt_templates')
          .insert({
            name: template.name,
            category: template.category,
            description: template.description,
            template_text: template.template,
            is_featured: template.isFeatured || false,
          })
          .select()
          .single();

        if (error) throw error;

        setTemplates([...templates, { 
          ...template, 
          id: data.id, 
          timesUsed: 0, 
          lastEdited: new Date().toISOString() 
        }]);
      }
      setEditTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert({
          name: `${template.name} (Copy)`,
          category: template.category,
          description: template.description,
          template_text: template.template,
          is_featured: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate = {
        ...template,
        id: data.id,
        name: `${template.name} (Copy)`,
        timesUsed: 0,
        lastEdited: new Date().toISOString(),
      };
      setTemplates([...templates, newTemplate]);
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Prompts Management</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('generated')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'generated'
              ? 'text-primary border-indigo-500'
              : 'text-muted-foreground border-transparent hover:text-white'
          }`}
        >
          Generated Prompts ({prompts.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'text-primary border-indigo-500'
              : 'text-muted-foreground border-transparent hover:text-white'
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary"
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'All' ? 'All Categories' : opt}</option>
              ))}
            </select>

            <select
              value={modelFilter}
              onChange={(e) => { setModelFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary"
            >
              {modelOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'All' ? 'All Models' : opt}</option>
              ))}
            </select>
          </div>

          {/* Prompts Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tokens</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPrompts.map(prompt => (
                    <tr key={prompt.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm text-muted-foreground">#{prompt.id}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{prompt.userEmail}</td>
                      <td className="px-4 py-3">
                        <Badge label={prompt.category} variant="purple" />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{prompt.model}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {prompt.inputTokens} / {prompt.outputTokens}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
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
                            className="p-1 text-muted-foreground hover:text-white"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFlag(prompt.id)}
                            className={`p-1 ${prompt.status === 'Flagged' ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'}`}
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ type: 'prompt', id: prompt.id })}
                            className="p-1 text-muted-foreground hover:text-red-400"
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
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded hover:text-white disabled:opacity-50"
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
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary rounded-lg text-sm text-white"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map(template => (
              <div key={template.id} className="bg-card border border-border rounded-xl p-4 hover:border-border transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-medium">{template.name}</h3>
                  <Badge label={template.category} variant="purple" />
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Used {template.timesUsed.toLocaleString()} times</span>
                  <span>Edited {new Date(template.lastEdited).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-muted text-muted-foreground rounded hover:bg-muted hover:text-white text-sm"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-muted text-muted-foreground rounded hover:bg-muted hover:text-white text-sm"
                  >
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ type: 'template', id: template.id })}
                    className="p-2 bg-muted text-muted-foreground rounded hover:bg-red-500/20 hover:text-red-400"
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
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Per-Plan Prompt Limits</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Monthly Limit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Avg Usage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {limits.map((item, i) => (
                <tr key={item.plan} className="border-b border-border/50">
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
                      className="px-3 py-1 bg-background border border-border rounded text-white text-sm w-32 focus:outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{item.avgUsage} prompts/mo</td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-primary hover:text-indigo-300">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => console.log('Saving limits:', limits)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary rounded-lg text-sm text-white"
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
                <span className="text-muted-foreground">Model:</span>
                <span className="ml-2 text-white">{viewPrompt.model}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tokens:</span>
                <span className="ml-2 text-white">{viewPrompt.inputTokens} in / {viewPrompt.outputTokens} out</span>
              </div>
              <div>
                <span className="text-muted-foreground">User:</span>
                <span className="ml-2 text-white">{viewPrompt.userEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2 text-white">{new Date(viewPrompt.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Input</h4>
              <div className="p-4 bg-background rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm text-white whitespace-pre-wrap">{viewPrompt.input}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Output</h4>
              <div className="p-4 bg-background rounded-lg max-h-60 overflow-y-auto">
                <p className="text-sm text-white whitespace-pre-wrap">{viewPrompt.output}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { handleFlag(viewPrompt.id); setViewPrompt(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  viewPrompt.status === 'Flagged' 
                    ? 'bg-muted text-muted-foreground' 
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
              <label className="block text-sm text-muted-foreground mb-2">Template Name</label>
              <input
                type="text"
                value={editTemplate.name}
                onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
                placeholder="e.g., Code Review Assistant"
              />
            </div>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Category</label>
              <select
                value={editTemplate.category}
                onChange={(e) => setEditTemplate({ ...editTemplate, category: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                {categoryOptions.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Description</label>
              <input
                type="text"
                value={editTemplate.description}
                onChange={(e) => setEditTemplate({ ...editTemplate, description: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
                placeholder="Brief description of what this template does"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Template Text</label>
              <textarea
                value={editTemplate.template}
                onChange={(e) => setEditTemplate({ ...editTemplate, template: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary font-mono text-sm"
                placeholder="Use {variable_name} for dynamic variables"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Variables (comma-separated)</label>
              <input
                type="text"
                value={editTemplate.variables?.join(', ') || ''}
                onChange={(e) => setEditTemplate({ ...editTemplate, variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
                placeholder="e.g., code, language, focus_areas"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditTemplate(null)}
                className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveTemplate(editTemplate)}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary"
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
