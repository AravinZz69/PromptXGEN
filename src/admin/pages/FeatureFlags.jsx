import React, { useState } from 'react';
import {
  Flag,
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  Users,
  Percent,
  Calendar,
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { mockFeatureFlags } from '../mockData';

export default function FeatureFlags() {
  const [flags, setFlags] = useState(mockFeatureFlags);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [editFlag, setEditFlag] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedSections, setExpandedSections] = useState(['Core Features', 'Experimental', 'A/B Tests']);
  const [addFlagOpen, setAddFlagOpen] = useState(false);

  // New flag form
  const [newFlag, setNewFlag] = useState({
    name: '',
    key: '',
    description: '',
    section: 'Experimental',
    enabled: false,
    rolloutPercentage: 100,
    enabledForPlans: [],
  });

  const sections = [...new Set(flags.map(f => f.section))];

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleFlag = (flagId) => {
    setFlags(prev => prev.map(f =>
      f.id === flagId ? { ...f, enabled: !f.enabled } : f
    ));
    setHasChanges(true);
  };

  const updateRollout = (flagId, percentage) => {
    setFlags(prev => prev.map(f =>
      f.id === flagId ? { ...f, rolloutPercentage: parseInt(percentage) || 0 } : f
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving feature flags:', flags);
    setHasChanges(false);
    alert('Feature flags saved successfully!');
  };

  const handleDelete = () => {
    setFlags(prev => prev.filter(f => f.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    setHasChanges(true);
  };

  const handleAddFlag = () => {
    const flag = {
      id: flags.length + 1,
      ...newFlag,
      createdAt: new Date().toISOString(),
    };
    setFlags([...flags, flag]);
    setNewFlag({
      name: '',
      key: '',
      description: '',
      section: 'Experimental',
      enabled: false,
      rolloutPercentage: 100,
      enabledForPlans: [],
    });
    setAddFlagOpen(false);
    setHasChanges(true);
  };

  const handleEditSave = () => {
    setFlags(prev => prev.map(f => f.id === editFlag.id ? editFlag : f));
    setEditFlag(null);
    setHasChanges(true);
  };

  const filteredFlags = flags.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFlags = sections.reduce((acc, section) => {
    acc[section] = filteredFlags.filter(f => f.section === section);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header with Save */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Feature Flags</h2>
          <p className="text-sm text-gray-400">Control feature rollouts and experiments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAddFlagOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
            Add Flag
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <p className="text-sm text-amber-200">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search feature flags..."
          className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total Flags</p>
          <p className="text-2xl font-bold text-white">{flags.length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Enabled</p>
          <p className="text-2xl font-bold text-emerald-400">{flags.filter(f => f.enabled).length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Experimental</p>
          <p className="text-2xl font-bold text-amber-400">{flags.filter(f => f.section === 'Experimental').length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">A/B Tests</p>
          <p className="text-2xl font-bold text-blue-400">{flags.filter(f => f.section === 'A/B Tests').length}</p>
        </div>
      </div>

      {/* Flags by Section */}
      <div className="space-y-4">
        {sections.map(section => (
          <div key={section} className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.includes(section) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <h3 className="text-lg font-semibold text-white">{section}</h3>
                <Badge label={`${groupedFlags[section]?.length || 0} flags`} variant="neutral" />
              </div>
              <span className="text-sm text-gray-500">
                {groupedFlags[section]?.filter(f => f.enabled).length || 0} enabled
              </span>
            </button>

            {/* Flags List */}
            {expandedSections.includes(section) && (
              <div className="border-t border-gray-800">
                {groupedFlags[section]?.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No flags in this section
                  </div>
                ) : (
                  groupedFlags[section]?.map(flag => (
                    <div
                      key={flag.id}
                      className="px-6 py-4 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleFlag(flag.id)}
                            className={`mt-1 relative w-12 h-6 rounded-full transition-colors ${
                              flag.enabled ? 'bg-emerald-500' : 'bg-gray-700'
                            }`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              flag.enabled ? 'left-6' : 'left-0.5'
                            }`} />
                          </button>

                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">{flag.name}</h4>
                              <code className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 font-mono">
                                {flag.key}
                              </code>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{flag.description}</p>
                            
                            {/* Meta */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {flag.rolloutPercentage < 100 && (
                                <span className="flex items-center gap-1">
                                  <Percent className="w-3 h-3" />
                                  {flag.rolloutPercentage}% rollout
                                </span>
                              )}
                              {flag.enabledForPlans?.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {flag.enabledForPlans.join(', ')}
                                </span>
                              )}
                              {flag.createdAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(flag.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {/* Rollout Slider */}
                          {flag.enabled && (
                            <div className="flex items-center gap-2 mr-4">
                              <span className="text-xs text-gray-500">Rollout:</span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={flag.rolloutPercentage}
                                onChange={(e) => updateRollout(flag.id, e.target.value)}
                                className="w-20 accent-emerald-500"
                              />
                              <span className="text-xs text-white w-8">{flag.rolloutPercentage}%</span>
                            </div>
                          )}
                          <button
                            onClick={() => setEditFlag({ ...flag })}
                            className="p-2 text-gray-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(flag)}
                            className="p-2 text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div className="text-sm text-blue-200">
          <p className="font-medium mb-1">Feature Flag Best Practices</p>
          <ul className="list-disc list-inside space-y-1 text-blue-300">
            <li>Use gradual rollouts (10% → 50% → 100%) for new features</li>
            <li>Always have a kill switch for critical features</li>
            <li>Clean up flags after full rollout (remove stale flags)</li>
            <li>Test features thoroughly at low rollout percentages</li>
          </ul>
        </div>
      </div>

      {/* Add Flag Modal */}
      <Modal isOpen={addFlagOpen} onClose={() => setAddFlagOpen(false)} title="Add Feature Flag">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Flag Name</label>
            <input
              type="text"
              value={newFlag.name}
              onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
              placeholder="e.g., New Dashboard UI"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Flag Key</label>
            <input
              type="text"
              value={newFlag.key}
              onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="e.g., new_dashboard_ui"
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={newFlag.description}
              onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
              placeholder="What does this feature flag control?"
              rows={3}
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Section</label>
            <select
              value={newFlag.section}
              onChange={(e) => setNewFlag({ ...newFlag, section: e.target.value })}
              className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Core Features">Core Features</option>
              <option value="Experimental">Experimental</option>
              <option value="A/B Tests">A/B Tests</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Initial State</label>
              <select
                value={newFlag.enabled ? 'enabled' : 'disabled'}
                onChange={(e) => setNewFlag({ ...newFlag, enabled: e.target.value === 'enabled' })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="disabled">Disabled</option>
                <option value="enabled">Enabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Rollout %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newFlag.rolloutPercentage}
                onChange={(e) => setNewFlag({ ...newFlag, rolloutPercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setAddFlagOpen(false)}
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFlag}
              disabled={!newFlag.name || !newFlag.key}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              Add Flag
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Flag Modal */}
      <Modal isOpen={!!editFlag} onClose={() => setEditFlag(null)} title="Edit Feature Flag">
        {editFlag && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Flag Name</label>
              <input
                type="text"
                value={editFlag.name}
                onChange={(e) => setEditFlag({ ...editFlag, name: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Flag Key</label>
              <input
                type="text"
                value={editFlag.key}
                onChange={(e) => setEditFlag({ ...editFlag, key: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={editFlag.description}
                onChange={(e) => setEditFlag({ ...editFlag, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Section</label>
              <select
                value={editFlag.section}
                onChange={(e) => setEditFlag({ ...editFlag, section: e.target.value })}
                className="w-full px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Core Features">Core Features</option>
                <option value="Experimental">Experimental</option>
                <option value="A/B Tests">A/B Tests</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditFlag(null)}
                className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Feature Flag"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will immediately disable this feature for all users.`}
        confirmLabel="Delete Flag"
        variant="danger"
      />
    </div>
  );
}
