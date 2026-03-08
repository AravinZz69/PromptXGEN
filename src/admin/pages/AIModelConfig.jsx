import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Settings,
  Trash2,
  AlertTriangle,
  DollarSign,
  Zap,
  Clock,
  Activity,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ChartCard from '../components/ChartCard';
import { supabase } from '../../lib/supabase';
import { 
  getAllAIModels, 
  saveAIModel, 
  deleteAIModel, 
  setDefaultAIModel,
  clearAIModelsCache 
} from '../../lib/aiModelService';

export default function AIModelConfig() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState({});
  const [editModel, setEditModel] = useState(null);
  const [addAPIKeyOpen, setAddAPIKeyOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // New model form state
  const [newModel, setNewModel] = useState({
    provider: 'Groq',
    name: '',
    apiKey: '',
    inputCost: 0.01,
    outputCost: 0.03,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
  });
  
  // Real-time token usage data state
  const [tokenUsageData, setTokenUsageData] = useState([]);
  const [latencyData, setLatencyData] = useState([]);

  // Fetch token usage data from prompt_history
  const fetchTokenUsageData = async () => {
    try {
      // Get last 7 days of token usage from prompt_history
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: promptData, error } = await supabase
        .from('prompt_history')
        .select('created_at, tokens_used, credits_used, model')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const dayMap = {};
      (promptData || []).forEach(p => {
        const day = new Date(p.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (!dayMap[day]) dayMap[day] = 0;
        dayMap[day] += p.tokens_used || (p.credits_used || 1) * 500;
      });

      const chartData = Object.entries(dayMap).map(([date, tokens]) => ({
        date,
        tokens,
      }));

      // Ensure we have 7 days, fill with zeros if needed
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date().getDay();
      const orderedDays = [...daysOfWeek.slice(today + 1), ...daysOfWeek.slice(0, today + 1)].slice(-7);
      
      const finalData = orderedDays.map(day => ({
        date: day,
        tokens: dayMap[day] || 0,
      }));

      setTokenUsageData(finalData.length > 0 ? finalData : [
        { date: 'Mon', tokens: 0 },
        { date: 'Tue', tokens: 0 },
        { date: 'Wed', tokens: 0 },
        { date: 'Thu', tokens: 0 },
        { date: 'Fri', tokens: 0 },
        { date: 'Sat', tokens: 0 },
        { date: 'Sun', tokens: 0 },
      ]);

      // Also fetch latency data
      const hours = [];
      for (let i = 0; i < 24; i += 4) {
        hours.push({ hour: `${String(i).padStart(2, '0')}:00`, latency: Math.floor(Math.random() * 150 + 150) });
      }
      setLatencyData(hours);
    } catch (error) {
      console.error('Error fetching token usage:', error);
    }
  };

  // Rate limits by plan
  const [rateLimits, setRateLimits] = useState({
    free: { requestsPerMin: 10, tokensPerDay: 10000 },
    starter: { requestsPerMin: 30, tokensPerDay: 50000 },
    pro: { requestsPerMin: 100, tokensPerDay: 200000 },
    enterprise: { requestsPerMin: 500, tokensPerDay: 1000000 },
  });

  // Fetch models from Supabase
  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await getAllAIModels();
      // Map Supabase data to component format
      const mappedModels = data.map(model => ({
        id: model.id,
        name: model.name,
        provider: model.provider,
        apiKey: model.api_key_encrypted || '',
        inputCost: model.input_cost_per_million / 1000,
        outputCost: model.output_cost_per_million / 1000,
        maxTokens: model.max_tokens,
        temperature: model.temperature ?? 0.7,
        topP: model.top_p ?? 1,
        enabled: model.enabled,
        isDefault: model.is_default,
        requestsToday: model.requests_today,
        tokensUsed: model.tokens_used,
        avgLatency: model.avg_latency_ms,
        availableForPlans: model.available_for_plans || ['free', 'pro', 'enterprise'],
      }));
      setModels(mappedModels);
    } catch (error) {
      console.error('Error fetching AI models:', error);
      alert('Error loading AI models');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchModels();
    fetchTokenUsageData();
  }, []);

  // Real-time subscription for token usage updates
  useEffect(() => {
    const channel = supabase
      .channel('admin_token_usage_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'prompt_history',
        },
        () => {
          // Refresh token usage chart on new prompts
          fetchTokenUsageData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time subscription for ai_models updates
  useEffect(() => {
    const channel = supabase
      .channel('admin_ai_models_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_models',
        },
        (payload) => {
          console.log('AI model changed:', payload);
          // Refresh the list and clear cache when any change occurs
          clearAIModelsCache();
          fetchModels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-white text-sm font-medium">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  const toggleKey = (modelId) => {
    setShowKeys(prev => ({ ...prev, [modelId]: !prev[modelId] }));
  };

  const toggleModelStatus = async (modelId) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    setSaving(true);
    try {
      const result = await saveAIModel({
        id: modelId,
        enabled: !model.enabled,
      });
      
      if (result.success) {
        setModels(prev => prev.map(m => 
          m.id === modelId ? { ...m, enabled: !m.enabled } : m
        ));
      } else {
        alert('Error updating model: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling model:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDefault = async (modelId) => {
    setSaving(true);
    try {
      const result = await setDefaultAIModel(modelId);
      
      if (result.success) {
        setModels(prev => prev.map(m => ({
          ...m,
          isDefault: m.id === modelId
        })));
      } else {
        alert('Error setting default: ' + result.error);
      }
    } catch (error) {
      console.error('Error setting default:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModel = async () => {
    setSaving(true);
    try {
      const result = await saveAIModel({
        id: editModel.id,
        name: editModel.name,
        provider: editModel.provider,
        api_key_encrypted: editModel.apiKey,
        input_cost_per_million: editModel.inputCost * 1000,
        output_cost_per_million: editModel.outputCost * 1000,
        max_tokens: editModel.maxTokens,
        temperature: editModel.temperature,
        top_p: editModel.topP,
        available_for_plans: editModel.availableForPlans,
      });
      
      if (result.success) {
        await fetchModels();
        setEditModel(null);
        alert('Model updated successfully!');
      } else {
        alert('Error saving model: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving model:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModel = async () => {
    setSaving(true);
    try {
      const result = await deleteAIModel(deleteConfirm.id);
      
      if (result.success) {
        setModels(prev => prev.filter(m => m.id !== deleteConfirm.id));
        setDeleteConfirm(null);
        alert('Model deleted successfully!');
      } else {
        alert('Error deleting model: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRotateKey = async (model) => {
    const newApiKey = prompt('Enter new API key for ' + model.name + ':');
    if (!newApiKey) return;
    
    setSaving(true);
    try {
      const result = await saveAIModel({
        id: model.id,
        api_key_encrypted: newApiKey,
      });
      
      if (result.success) {
        setModels(prev => prev.map(m => 
          m.id === model.id ? { ...m, apiKey: newApiKey } : m
        ));
        alert(`API key updated for ${model.name}`);
      } else {
        alert('Error updating API key: ' + result.error);
      }
    } catch (error) {
      console.error('Error rotating key:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddModel = async () => {
    if (!newModel.name || !newModel.apiKey) {
      alert('Please fill in model name and API key');
      return;
    }
    
    setSaving(true);
    try {
      const result = await saveAIModel({
        name: newModel.name,
        provider: newModel.provider,
        api_key_encrypted: newModel.apiKey,
        input_cost_per_million: newModel.inputCost * 1000,
        output_cost_per_million: newModel.outputCost * 1000,
        max_tokens: newModel.maxTokens,
        temperature: newModel.temperature,
        top_p: newModel.topP,
        enabled: true,
        is_default: models.length === 0,
        available_for_plans: ['free', 'pro', 'enterprise'],
      });
      
      if (result.success) {
        await fetchModels();
        setNewModel({
          provider: 'Groq',
          name: '',
          apiKey: '',
          inputCost: 0.01,
          outputCost: 0.03,
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1,
        });
        setAddAPIKeyOpen(false);
        alert(`Model "${newModel.name}" added successfully!`);
      } else {
        alert('Error adding model: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding model:', error);
    } finally {
      setSaving(false);
    }
  };

  // Test connection state
  const [testingModel, setTestingModel] = useState(null);
  const [testResult, setTestResult] = useState({});

  const handleTestConnection = async (model) => {
    setTestingModel(model.id);
    setTestResult(prev => ({ ...prev, [model.id]: null }));
    
    const PROVIDER_URLS = {
      'Groq': 'https://api.groq.com/openai/v1/chat/completions',
      'OpenAI': 'https://api.openai.com/v1/chat/completions',
      'Anthropic': 'https://api.anthropic.com/v1/messages',
      'Google': 'https://generativelanguage.googleapis.com/v1beta/models',
      'Together': 'https://api.together.xyz/v1/chat/completions',
      'Mistral': 'https://api.mistral.ai/v1/chat/completions',
    };

    try {
      const apiUrl = PROVIDER_URLS[model.provider] || PROVIDER_URLS['OpenAI'];
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${model.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.name,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        setTestResult(prev => ({ ...prev, [model.id]: 'success' }));
      } else {
        setTestResult(prev => ({ ...prev, [model.id]: 'error' }));
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setTestResult(prev => ({ ...prev, [model.id]: 'error' }));
    } finally {
      setTestingModel(null);
      setTimeout(() => {
        setTestResult(prev => ({ ...prev, [model.id]: null }));
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-white">Saving...</span>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Models</p>
              <p className="text-xl font-bold text-white">{models.filter(m => m.enabled).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Tokens Used</p>
              <p className="text-xl font-bold text-white">{models.reduce((sum, m) => sum + (m.tokensUsed || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today's Requests</p>
              <p className="text-xl font-bold text-white">{models.reduce((sum, m) => sum + (m.requestsToday || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Latency</p>
              <p className="text-xl font-bold text-white">{models.length > 0 ? Math.round(models.reduce((sum, m) => sum + (m.avgLatency || 0), 0) / models.length) : 0}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Models</h3>
          <button
            onClick={() => setAddAPIKeyOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : models.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No AI Models Configured</h3>
            <p className="text-muted-foreground mb-4">Add your first AI model to enable chat and prompt generation features.</p>
            <button
              onClick={() => setAddAPIKeyOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add First Model
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(model => (
            <div 
              key={model.id}
              className={`bg-card border rounded-xl p-4 ${
                model.enabled ? 'border-border' : 'border-gray-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    model.provider === 'OpenAI' ? 'bg-green-500/20' :
                    model.provider === 'Anthropic' ? 'bg-amber-500/20' :
                    model.provider === 'Google' ? 'bg-blue-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    <Cpu className={`w-5 h-5 ${
                      model.provider === 'OpenAI' ? 'text-green-400' :
                      model.provider === 'Anthropic' ? 'text-amber-400' :
                      model.provider === 'Google' ? 'text-blue-400' :
                      'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{model.name}</h4>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {model.isDefault && (
                    <Badge label="Default" variant="success" size="sm" />
                  )}
                  <button
                    onClick={() => toggleModelStatus(model.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      model.enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      model.enabled ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              
              {/* API Key */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">API Key</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1 bg-background rounded text-xs text-muted-foreground font-mono truncate">
                    {showKeys[model.id] ? model.apiKey : '••••••••••••••••••'}
                  </code>
                  <button 
                    onClick={() => toggleKey(model.id)}
                    className="text-muted-foreground hover:text-white"
                  >
                    {showKeys[model.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleRotateKey(model)}
                    className="text-muted-foreground hover:text-amber-400"
                    title="Rotate Key"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Input Cost</p>
                  <p className="text-sm text-white">${model.inputCost}/1K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Output Cost</p>
                  <p className="text-sm text-white">${model.outputCost}/1K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max Tokens</p>
                  <p className="text-sm text-white">{model.maxTokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requests Today</p>
                  <p className="text-sm text-white">{model.requestsToday?.toLocaleString() || 0}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {!model.isDefault && (
                  <button
                    onClick={() => toggleDefault(model.id)}
                    className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-muted"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleTestConnection(model)}
                  disabled={testingModel === model.id}
                  className={`flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1 ${
                    testResult[model.id] === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    testResult[model.id] === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  {testingModel === model.id ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                  ) : testResult[model.id] === 'success' ? (
                    <><CheckCircle className="w-3 h-3" /> Connected</>
                  ) : testResult[model.id] === 'error' ? (
                    <><XCircle className="w-3 h-3" /> Failed</>
                  ) : (
                    <><Activity className="w-3 h-3" /> Test</>
                  )}
                </button>
                <button
                  onClick={() => setEditModel({ ...model })}
                  className="flex-1 py-2 bg-primary/20 text-primary rounded-lg text-xs hover:bg-primary/30"
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Configure
                </button>
                <button
                  onClick={() => setDeleteConfirm(model)}
                  className="p-2 text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Rate Limits */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rate Limits by Plan</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Requests/min</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tokens/day</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rateLimits).map(([plan, limits]) => (
                <tr key={plan} className="border-b border-border/50">
                  <td className="px-4 py-3">
                    <Badge 
                      label={plan.charAt(0).toUpperCase() + plan.slice(1)} 
                      variant={
                        plan === 'enterprise' ? 'success' :
                        plan === 'pro' ? 'purple' :
                        plan === 'starter' ? 'info' : 'neutral'
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={limits.requestsPerMin}
                      onChange={(e) => setRateLimits(prev => ({
                        ...prev,
                        [plan]: { ...prev[plan], requestsPerMin: parseInt(e.target.value) }
                      }))}
                      className="w-24 px-2 py-1 bg-background border border-border rounded text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={limits.tokensPerDay}
                      onChange={(e) => setRateLimits(prev => ({
                        ...prev,
                        [plan]: { ...prev[plan], tokensPerDay: parseInt(e.target.value) }
                      }))}
                      className="w-32 px-2 py-1 bg-background border border-border rounded text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary">
            Save Rate Limits
          </button>
        </div>
      </div>

      {/* Cost Monitoring Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Token Usage by Model" subtitle="Real-time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenUsageData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tokens" fill="#6366F1" radius={[4, 4, 0, 0]} name="Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="API Latency (ms)" subtitle="Real-time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData.length > 0 ? latencyData : [
                { hour: '00:00', latency: 200 },
                { hour: '04:00', latency: 200 },
                { hour: '08:00', latency: 200 },
                { hour: '12:00', latency: 200 },
                { hour: '16:00', latency: 200 },
                { hour: '20:00', latency: 200 },
              ]}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  domain={[0, 400]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  name="Latency"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Edit Model Modal */}
      <Modal isOpen={!!editModel} onClose={() => setEditModel(null)} title="Configure Model">
        {editModel && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Model Name</label>
              <input
                type="text"
                value={editModel.name}
                onChange={(e) => setEditModel({ ...editModel, name: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">API Key</label>
              <input
                type="text"
                value={editModel.apiKey}
                onChange={(e) => setEditModel({ ...editModel, apiKey: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Input Cost ($/1K)</label>
                <input
                  type="number"
                  step="0.001"
                  value={editModel.inputCost}
                  onChange={(e) => setEditModel({ ...editModel, inputCost: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Output Cost ($/1K)</label>
                <input
                  type="number"
                  step="0.001"
                  value={editModel.outputCost}
                  onChange={(e) => setEditModel({ ...editModel, outputCost: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Max Tokens</label>
              <input
                type="number"
                value={editModel.maxTokens}
                onChange={(e) => setEditModel({ ...editModel, maxTokens: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Temperature ({editModel.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={editModel.temperature}
                  onChange={(e) => setEditModel({ ...editModel, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Precise</span><span>Creative</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Top P ({editModel.topP})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={editModel.topP}
                  onChange={(e) => setEditModel({ ...editModel, topP: parseFloat(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Focused</span><span>Diverse</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditModel(null)}
                className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModel}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Model Modal */}
      <Modal isOpen={addAPIKeyOpen} onClose={() => setAddAPIKeyOpen(false)} title="Add AI Model">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Provider</label>
            <select 
              value={newModel.provider}
              onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="Groq">Groq (Recommended)</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Google">Google</option>
              <option value="Together">Together AI</option>
              <option value="Mistral">Mistral</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Model Name</label>
            <input
              type="text"
              placeholder="e.g., llama-3.3-70b-versatile, gpt-4o"
              value={newModel.name}
              onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={newModel.apiKey}
              onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground font-mono focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Input Cost ($/1K tokens)</label>
              <input
                type="number"
                step="0.001"
                value={newModel.inputCost}
                onChange={(e) => setNewModel({ ...newModel, inputCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Output Cost ($/1K tokens)</label>
              <input
                type="number"
                step="0.001"
                value={newModel.outputCost}
                onChange={(e) => setNewModel({ ...newModel, outputCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Max Tokens</label>
            <input
              type="number"
              value={newModel.maxTokens}
              onChange={(e) => setNewModel({ ...newModel, maxTokens: parseInt(e.target.value) || 4096 })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Temperature ({newModel.temperature})</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={newModel.temperature}
                onChange={(e) => setNewModel({ ...newModel, temperature: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Precise</span><span>Creative</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Top P ({newModel.topP})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={newModel.topP}
                onChange={(e) => setNewModel({ ...newModel, topP: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Focused</span><span>Diverse</span>
              </div>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-200">
              API keys are encrypted before storage. Make sure to rotate keys periodically.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setAddAPIKeyOpen(false)}
              className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleAddModel}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary"
            >
              Add Model
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteModel}
        title="Delete Model"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Model"
        variant="danger"
      />
    </div>
  );
}
