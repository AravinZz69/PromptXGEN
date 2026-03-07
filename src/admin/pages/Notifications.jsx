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

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [viewNotification, setViewNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

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

  useEffect(() => {
    fetchNotifications();
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
          <h3 className="text-lg font-semibold text-white">Notification Templates</h3>
          <button className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary">
            Create Template
          </button>
        </div>

        {/* MOCK DATA - Templates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Welcome Email', description: 'Sent to new users after signup', uses: 1247 },
            { name: 'Payment Failed', description: 'Alert when payment processing fails', uses: 89 },
            { name: 'Feature Announcement', description: 'New feature release notification', uses: 456 },
            { name: 'Weekly Digest', description: 'Weekly usage summary email', uses: 3241 },
            { name: 'Plan Upgrade', description: 'Confirmation for plan upgrades', uses: 234 },
            { name: 'Account Security', description: 'Security alerts and notices', uses: 167 },
          ].map((template, i) => (
            <div key={i} className="bg-background border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-1">{template.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{template.uses} uses</span>
                <button className="text-xs text-primary hover:text-indigo-300">Use Template</button>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
