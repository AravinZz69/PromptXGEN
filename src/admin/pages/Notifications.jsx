import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  Mail,
  MessageSquare,
  Calendar,
  Eye,
  Trash2,
  Edit,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  FileText,
  Copy,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { supabase } from '../../lib/supabase';

const channelIcons = {
  email: Mail,
  'in-app': Bell,
  push: MessageSquare,
};

const statusVariants = {
  Sent: 'success',
  Scheduled: 'info',
  Draft: 'neutral',
  Failed: 'danger',
};

const categoryColors = {
  onboarding: 'bg-green-500/20 text-green-400',
  billing: 'bg-amber-500/20 text-amber-400',
  announcement: 'bg-blue-500/20 text-blue-400',
  security: 'bg-red-500/20 text-red-400',
  digest: 'bg-purple-500/20 text-purple-400',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [viewNotification, setViewNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Template modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    title: '',
    message: '',
    audience: 'all',
    channels: ['email', 'in-app'],
    priority: 'normal',
    category: 'announcement',
  });

  // New notification form
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    audience: 'all',
    channels: ['email', 'in-app'],
    scheduledFor: '',
    priority: 'normal',
  });

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedNotifications = (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        audience: n.audience || 'all',
        channels: n.channels || ['email', 'in-app'],
        status: n.status || 'Draft',
        sentAt: n.sent_at,
        scheduledFor: n.scheduled_for,
        recipients: n.recipients || 0,
        openRate: n.open_rate || 0,
        priority: n.priority || 'normal',
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates from Supabase
  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('uses_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Use default templates if DB not available
      setTemplates([
        { id: '1', name: 'Welcome Email', description: 'Sent to new users after signup', title: 'Welcome to PromptXGEN!', message: 'Welcome! Start generating powerful prompts today.', uses_count: 1247, category: 'onboarding', channels: ['email', 'in-app'], audience: 'all', priority: 'normal' },
        { id: '2', name: 'Payment Failed', description: 'Alert when payment processing fails', title: 'Payment Failed', message: 'We couldn\'t process your payment.', uses_count: 89, category: 'billing', channels: ['email', 'in-app'], audience: 'pro', priority: 'high' },
        { id: '3', name: 'Feature Announcement', description: 'New feature release notification', title: 'New Feature!', message: 'Check out our latest feature.', uses_count: 456, category: 'announcement', channels: ['email', 'in-app'], audience: 'all', priority: 'normal' },
        { id: '4', name: 'Weekly Digest', description: 'Weekly usage summary email', title: 'Your Weekly Report', message: 'Here\'s your weekly summary.', uses_count: 3241, category: 'digest', channels: ['email'], audience: 'all', priority: 'low' },
        { id: '5', name: 'Plan Upgrade', description: 'Confirmation for plan upgrades', title: 'Welcome to Pro!', message: 'Congrats on upgrading!', uses_count: 234, category: 'billing', channels: ['email', 'in-app'], audience: 'pro', priority: 'normal' },
        { id: '6', name: 'Account Security', description: 'Security alerts and notices', title: 'Security Alert', message: 'New login detected.', uses_count: 167, category: 'security', channels: ['email', 'in-app', 'push'], audience: 'all', priority: 'high' },
      ]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, []);

  // Stats computed from data
  const stats = [
    { label: 'Total Sent', value: notifications.filter(n => n.status === 'Sent').length.toLocaleString(), icon: Send, color: 'emerald' },
    { label: 'Open Rate', value: notifications.length > 0 ? `${(notifications.reduce((acc, n) => acc + (n.openRate || 0), 0) / notifications.length).toFixed(1)}%` : '0%', icon: Eye, color: 'blue' },
    { label: 'Scheduled', value: notifications.filter(n => n.status === 'Scheduled').length, icon: Calendar, color: 'amber' },
    { label: 'Drafts', value: notifications.filter(n => n.status === 'Draft').length, icon: Clock, color: 'indigo' },
  ];

  const filteredNotifications = notifications.filter(n =>
    filterStatus === 'all' || n.status === filterStatus
  );

  const handleSendNotification = async (schedule = false) => {
    try {
      // Insert admin notification record
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert({
          title: newNotification.title,
          message: newNotification.message,
          audience: newNotification.audience,
          channels: newNotification.channels,
          status: schedule ? 'Scheduled' : 'Sent',
          sent_at: schedule ? null : new Date().toISOString(),
          scheduled_for: schedule ? newNotification.scheduledFor : null,
          priority: newNotification.priority,
          recipients: 0, // Will be updated by the function
        })
        .select()
        .single();

      if (error) throw error;

      let actualRecipients = 0;

      // If in-app channel is selected and not scheduled, send to users immediately
      if (!schedule && newNotification.channels.includes('in-app')) {
        const { data: result, error: sendError } = await supabase
          .rpc('send_notification_to_users', {
            p_admin_notification_id: data.id,
            p_title: newNotification.title,
            p_message: newNotification.message,
            p_audience: newNotification.audience,
            p_priority: newNotification.priority,
          });

        if (sendError) {
          console.error('Error sending in-app notifications:', sendError);
        } else {
          actualRecipients = result || 0;
        }
      }

      const notification = {
        id: data.id,
        ...newNotification,
        status: schedule ? 'Scheduled' : 'Sent',
        sentAt: schedule ? null : new Date().toISOString(),
        recipients: actualRecipients,
        openRate: 0,
      };

      setNotifications([notification, ...notifications]);
      setNewNotification({
        title: '',
        message: '',
        audience: 'all',
        channels: ['email', 'in-app'],
        scheduledFor: '',
        priority: 'normal',
      });
      setComposeOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const toggleChannel = (channel) => {
    setNewNotification(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const toggleTemplateChannel = (channel) => {
    setTemplateForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  // Use a template - populate compose form with template content
  const useTemplate = async (template) => {
    // Increment usage count
    if (template.id && !template.id.toString().startsWith('temp_')) {
      try {
        await supabase.rpc('increment_template_usage', { template_id: template.id });
        setTemplates(prev => prev.map(t => 
          t.id === template.id ? { ...t, uses_count: (t.uses_count || 0) + 1 } : t
        ));
      } catch (error) {
        console.error('Error incrementing template usage:', error);
      }
    }
    
    // Populate the compose form
    setNewNotification({
      title: template.title || '',
      message: template.message || '',
      audience: template.audience || 'all',
      channels: template.channels || ['email', 'in-app'],
      scheduledFor: '',
      priority: template.priority || 'normal',
    });
    setComposeOpen(true);
  };

  // Open template modal for creating or editing
  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name || '',
        description: template.description || '',
        title: template.title || '',
        message: template.message || '',
        audience: template.audience || 'all',
        channels: template.channels || ['email', 'in-app'],
        priority: template.priority || 'normal',
        category: template.category || 'announcement',
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        description: '',
        title: '',
        message: '',
        audience: 'all',
        channels: ['email', 'in-app'],
        priority: 'normal',
        category: 'announcement',
      });
    }
    setTemplateModalOpen(true);
  };

  // Save template (create or update)
  const saveTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('notification_templates')
          .update({
            name: templateForm.name,
            description: templateForm.description,
            title: templateForm.title,
            message: templateForm.message,
            audience: templateForm.audience,
            channels: templateForm.channels,
            priority: templateForm.priority,
            category: templateForm.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? { ...t, ...templateForm } : t
        ));
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('notification_templates')
          .insert({
            name: templateForm.name,
            description: templateForm.description,
            title: templateForm.title,
            message: templateForm.message,
            audience: templateForm.audience,
            channels: templateForm.channels,
            priority: templateForm.priority,
            category: templateForm.category,
          })
          .select()
          .single();

        if (error) throw error;

        setTemplates(prev => [data, ...prev]);
      }

      setTemplateModalOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  // Delete template
  const deleteTemplate = async (templateId) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Notifications</h2>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Section */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Quick Compose</h3>
            <button
              onClick={() => setComposeOpen(true)}
              className="flex items-center gap-1 text-sm text-primary hover:text-indigo-300"
            >
              <Plus className="w-4 h-4" />
              Full Editor
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Title</label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                placeholder="Notification title..."
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Message</label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                placeholder="Write your message..."
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Audience</label>
              <select
                value={newNotification.audience}
                onChange={(e) => setNewNotification({ ...newNotification, audience: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All Users (3,241)</option>
                <option value="pro">Pro Users (890)</option>
                <option value="free">Free Users (2,351)</option>
                <option value="enterprise">Enterprise (42)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Channels</label>
              <div className="flex gap-2">
                {['email', 'in-app', 'push'].map(channel => {
                  const Icon = channelIcons[channel];
                  const isSelected = newNotification.channels.includes(channel);
                  return (
                    <button
                      key={channel}
                      onClick={() => toggleChannel(channel)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary/20 border-indigo-500 text-primary'
                          : 'bg-background border-border text-muted-foreground hover:border-border'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {channel.charAt(0).toUpperCase() + channel.slice(1).replace('-', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleSendNotification(false)}
                disabled={!newNotification.title || !newNotification.message}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Now
              </button>
              <button
                onClick={() => setComposeOpen(true)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sent Notifications Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Notification History</h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 bg-background border border-border rounded text-sm text-muted-foreground focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="Sent">Sent</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Notification</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Channels</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Recipients</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Open Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map(notification => (
                  <tr key={notification.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.sentAt 
                            ? new Date(notification.sentAt).toLocaleDateString() 
                            : notification.scheduledFor 
                              ? `Scheduled: ${new Date(notification.scheduledFor).toLocaleDateString()}`
                              : 'Draft'
                          }
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {notification.channels.map(channel => {
                          const Icon = channelIcons[channel];
                          return (
                            <div
                              key={channel}
                              className="w-6 h-6 bg-muted rounded flex items-center justify-center"
                              title={channel}
                            >
                              <Icon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {notification.recipients?.toLocaleString() || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={notification.status} variant={statusVariants[notification.status]} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {notification.openRate ? `${notification.openRate}%` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewNotification(notification)}
                          className="text-muted-foreground hover:text-white"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {notification.status === 'Draft' && (
                          <button
                            onClick={() => {
                              setNewNotification(notification);
                              setComposeOpen(true);
                            }}
                            className="text-muted-foreground hover:text-primary"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(notification)}
                          className="text-muted-foreground hover:text-red-400"
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
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Notification Templates</h3>
            <p className="text-xs text-muted-foreground">{templates.length} templates available</p>
          </div>
          <button 
            onClick={() => openTemplateModal()}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>

        {templatesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No templates yet</p>
            <button 
              onClick={() => openTemplateModal()}
              className="mt-3 text-primary hover:text-primary/80 text-sm"
            >
              Create your first template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-background border border-border rounded-lg p-4 group hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">{template.name}</h4>
                  {template.category && (
                    <span className={`px-2 py-0.5 text-xs rounded ${categoryColors[template.category] || 'bg-muted text-muted-foreground'}`}>
                      {template.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  {(template.channels || []).map(channel => {
                    const Icon = channelIcons[channel];
                    return Icon ? (
                      <div
                        key={channel}
                        className="w-5 h-5 bg-muted rounded flex items-center justify-center"
                        title={channel}
                      >
                        <Icon className="w-3 h-3 text-muted-foreground" />
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{(template.uses_count || 0).toLocaleString()} uses</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openTemplateModal(template)}
                      className="text-xs text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => useTemplate(template)}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Compose Modal */}
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title="Compose Notification" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Title</label>
            <input
              type="text"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              placeholder="Notification title..."
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Message</label>
            <textarea
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              placeholder="Write your message..."
              rows={6}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Audience</label>
              <select
                value={newNotification.audience}
                onChange={(e) => setNewNotification({ ...newNotification, audience: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">All Users (3,241)</option>
                <option value="pro">Pro Users (890)</option>
                <option value="free">Free Users (2,351)</option>
                <option value="enterprise">Enterprise (42)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Priority</label>
              <select
                value={newNotification.priority}
                onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Channels</label>
            <div className="flex gap-2">
              {['email', 'in-app', 'push'].map(channel => {
                const Icon = channelIcons[channel];
                const isSelected = newNotification.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary/20 border-indigo-500 text-primary'
                        : 'bg-background border-border text-muted-foreground hover:border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {channel.charAt(0).toUpperCase() + channel.slice(1).replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={newNotification.scheduledFor}
              onChange={(e) => setNewNotification({ ...newNotification, scheduledFor: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setComposeOpen(false)}
              className="flex-1 py-2 bg-muted text-white rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setNotifications([{ ...newNotification, id: notifications.length + 1, status: 'Draft' }, ...notifications]);
                setComposeOpen(false);
              }}
              className="py-2 px-4 bg-muted text-white rounded-lg hover:bg-muted"
            >
              Save Draft
            </button>
            {newNotification.scheduledFor ? (
              <button
                onClick={() => handleSendNotification(true)}
                disabled={!newNotification.title || !newNotification.message}
                className="flex-1 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
            ) : (
              <button
                onClick={() => handleSendNotification(false)}
                disabled={!newNotification.title || !newNotification.message}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Now
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* View Notification Modal */}
      <Modal isOpen={!!viewNotification} onClose={() => setViewNotification(null)} title="Notification Details">
        {viewNotification && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Title</p>
              <p className="text-white">{viewNotification.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Message</p>
              <p className="text-muted-foreground">{viewNotification.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
                <Badge label={viewNotification.status} variant={statusVariants[viewNotification.status]} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Channels</p>
                <div className="flex gap-1">
                  {viewNotification.channels.map(c => (
                    <Badge key={c} label={c} variant="neutral" />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Recipients</p>
                <p className="text-white">{viewNotification.recipients?.toLocaleString() || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Open Rate</p>
                <p className="text-white">{viewNotification.openRate ? `${viewNotification.openRate}%` : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Template Create/Edit Modal */}
      <Modal 
        isOpen={templateModalOpen} 
        onClose={() => setTemplateModalOpen(false)} 
        title={editingTemplate ? 'Edit Template' : 'Create Template'} 
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Template Name *</label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., Welcome Email"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Category</label>
              <select
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="onboarding">Onboarding</option>
                <option value="billing">Billing</option>
                <option value="announcement">Announcement</option>
                <option value="security">Security</option>
                <option value="digest">Digest</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Description</label>
            <input
              type="text"
              value={templateForm.description}
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              placeholder="Brief description of when this template is used"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Notification Title *</label>
            <input
              type="text"
              value={templateForm.title}
              onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
              placeholder="The actual notification title users will see"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Message *</label>
            <textarea
              value={templateForm.message}
              onChange={(e) => setTemplateForm({ ...templateForm, message: e.target.value })}
              placeholder="The notification message. Use {{variable_name}} for dynamic content."
              rows={4}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Use {'{{'}variable_name{'}'} for dynamic content like {'{{'}user_name{'}}'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Target Audience</label>
              <select
                value={templateForm.audience}
                onChange={(e) => setTemplateForm({ ...templateForm, audience: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">All Users</option>
                <option value="pro">Pro Users</option>
                <option value="free">Free Users</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Priority</label>
              <select
                value={templateForm.priority}
                onChange={(e) => setTemplateForm({ ...templateForm, priority: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Channels</label>
            <div className="flex gap-2">
              {['email', 'in-app', 'push'].map(channel => {
                const Icon = channelIcons[channel];
                const isSelected = templateForm.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleTemplateChannel(channel)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-background border-border text-muted-foreground hover:border-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {channel.charAt(0).toUpperCase() + channel.slice(1).replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            {editingTemplate && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this template?')) {
                    deleteTemplate(editingTemplate.id);
                    setTemplateModalOpen(false);
                  }
                }}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={() => setTemplateModalOpen(false)}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              disabled={!templateForm.name || !templateForm.title || !templateForm.message}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
