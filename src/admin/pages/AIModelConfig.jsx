import React, { useState } from 'react';
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
import { mockAIModels, mockChartData } from '../mockData';

export default function AIModelConfig() {
  const [models, setModels] = useState(mockAIModels);
  const [showKeys, setShowKeys] = useState({});
  const [editModel, setEditModel] = useState(null);
  const [addAPIKeyOpen, setAddAPIKeyOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // New model form state
  const [newModel, setNewModel] = useState({
    provider: 'OpenAI',
    name: '',
    apiKey: '',
    inputCost: 0.01,
    outputCost: 0.03,
    maxTokens: 4096,
  });
  
  // MOCK DATA - Cost tracking
  const costData = mockChartData.tokenUsage;

  // MOCK DATA - Rate limits
  const [rateLimits, setRateLimits] = useState({
    free: { requestsPerMin: 10, tokensPerDay: 10000 },
    starter: { requestsPerMin: 30, tokensPerDay: 50000 },
    pro: { requestsPerMin: 100, tokensPerDay: 200000 },
    enterprise: { requestsPerMin: 500, tokensPerDay: 1000000 },
  });

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

  const toggleModelStatus = (modelId) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const toggleDefault = (modelId) => {
    setModels(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === modelId
    })));
  };

  const handleSaveModel = () => {
    setModels(prev => prev.map(m => 
      m.id === editModel.id ? editModel : m
    ));
    setEditModel(null);
  };

  const handleDeleteModel = () => {
    setModels(prev => prev.filter(m => m.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  const handleRotateKey = (model) => {
    const newApiKey = `sk-${Math.random().toString(36).slice(2, 12)}...${Math.random().toString(36).slice(2, 8)}`;
    setModels(prev => prev.map(m => 
      m.id === model.id ? { ...m, apiKey: newApiKey } : m
    ));
    alert(`API key rotated for ${model.name}`);
  };

  const handleAddModel = () => {
    if (!newModel.name || !newModel.apiKey) {
      alert('Please fill in model name and API key');
      return;
    }
    
    const model = {
      id: Date.now(),
      name: newModel.name,
      provider: newModel.provider,
      apiKey: newModel.apiKey,
      inputCost: newModel.inputCost,
      outputCost: newModel.outputCost,
      maxTokens: newModel.maxTokens,
      enabled: true,
      isDefault: false,
      requestsToday: 0,
    };
    
    setModels(prev => [...prev, model]);
    setNewModel({
      provider: 'OpenAI',
      name: '',
      apiKey: '',
      inputCost: 0.01,
      outputCost: 0.03,
      maxTokens: 4096,
    });
    setAddAPIKeyOpen(false);
    alert(`Model "${model.name}" added successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* MOCK DATA */}
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
              <p className="text-xs text-muted-foreground">Est. Monthly Cost</p>
              <p className="text-xl font-bold text-white">$2,847</p>
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
              <p className="text-xl font-bold text-white">12,483</p>
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
              <p className="text-xl font-bold text-white">234ms</p>
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
              <div className="flex gap-2">
                {!model.isDefault && (
                  <button
                    onClick={() => toggleDefault(model.id)}
                    className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-muted"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => setEditModel({ ...model })}
                  className="flex-1 py-2 bg-primary/20 text-primary rounded-lg text-xs hover:bg-primary/90/30"
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
        <ChartCard title="Token Usage by Model" subtitle="Last 7 Days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
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

        <ChartCard title="API Latency (ms)" subtitle="24-hour average">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { hour: '00:00', latency: 210 },
                { hour: '04:00', latency: 185 },
                { hour: '08:00', latency: 290 },
                { hour: '12:00', latency: 320 },
                { hour: '16:00', latency: 280 },
                { hour: '20:00', latency: 245 },
                { hour: '24:00', latency: 220 },
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
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Google">Google</option>
              <option value="Mistral">Mistral</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Model Name</label>
            <input
              type="text"
              placeholder="e.g., GPT-4o, Claude 3.5 Sonnet"
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
