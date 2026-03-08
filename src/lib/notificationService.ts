/**
 * Notification Service
 * Handles user notifications - fetching, marking as read, real-time subscriptions
 */

import { supabase } from './supabase';

export interface UserNotification {
  id: string;
  user_id: string;
  admin_notification_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  read_at?: string;
  action_url?: string;
  created_at: string;
}

/**
 * Fetch all notifications for the current user
 */
export async function getUserNotifications(): Promise<UserNotification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_notifications')
    .update({ 
      read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('user_notifications')
    .update({ 
      read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking all as read:', error);
    return false;
  }

  return true;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

/**
 * Subscribe to real-time notification updates
 */
export function subscribeToNotifications(
  userId: string,
  onInsert: (notification: UserNotification) => void,
  onUpdate: (notification: UserNotification) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel(`user_notifications_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onInsert(payload.new as UserNotification);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as UserNotification);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onDelete(payload.old.id);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Helper to get notification icon color based on type
 */
export function getNotificationTypeColor(type: string): string {
  switch (type) {
    case 'success':
      return 'text-emerald-400 bg-emerald-500/20';
    case 'warning':
      return 'text-amber-400 bg-amber-500/20';
    case 'error':
      return 'text-red-400 bg-red-500/20';
    case 'announcement':
      return 'text-blue-400 bg-blue-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
}

/**
 * Helper to get priority badge color
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500/20 text-red-400';
    case 'high':
      return 'bg-amber-500/20 text-amber-400';
    case 'normal':
      return 'bg-blue-500/20 text-blue-400';
    case 'low':
      return 'bg-gray-500/20 text-gray-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}
