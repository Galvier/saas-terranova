
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Converter dados do Supabase para nossa interface
      const typedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        message: item.message,
        type: item.type as 'info' | 'warning' | 'success' | 'error',
        is_read: item.is_read,
        metadata: item.metadata || {},
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setNotifications(typedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_as_read', {
        notification_id: notificationId
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('mark_all_notifications_as_read');

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Realtime notification update:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        const newNotification: Notification = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.type as 'info' | 'warning' | 'success' | 'error',
          is_read: payload.new.is_read,
          metadata: payload.new.metadata || {},
          created_at: payload.new.created_at,
          updated_at: payload.new.updated_at
        };
        setNotifications(prev => [newNotification, ...prev]);
        break;
      case 'UPDATE':
        const updatedNotification: Notification = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.type as 'info' | 'warning' | 'success' | 'error',
          is_read: payload.new.is_read,
          metadata: payload.new.metadata || {},
          created_at: payload.new.created_at,
          updated_at: payload.new.updated_at
        };
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === updatedNotification.id ? updatedNotification : notification
          )
        );
        break;
      case 'DELETE':
        setNotifications(prev =>
          prev.filter(notification => notification.id !== payload.old.id)
        );
        break;
    }
  }, []);

  useRealTimeSubscription(
    {
      table: 'notifications',
      event: '*'
    },
    handleRealtimeUpdate
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
