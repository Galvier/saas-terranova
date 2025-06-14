
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        message: item.message,
        type: item.type as 'info' | 'warning' | 'success' | 'error',
        is_read: item.is_read,
        metadata: (typeof item.metadata === 'object' && item.metadata !== null && !Array.isArray(item.metadata)) 
          ? item.metadata as Record<string, any>
          : {},
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

  // Callback para atualização em tempo real
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Realtime notification update:', payload);

    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' && newRecord) {
      // Verificar se a notificação é para o usuário atual
      if (newRecord.user_id === user?.id) {
        const typedNotification: Notification = {
          id: newRecord.id,
          user_id: newRecord.user_id,
          title: newRecord.title,
          message: newRecord.message,
          type: newRecord.type as 'info' | 'warning' | 'success' | 'error',
          is_read: newRecord.is_read,
          metadata: (typeof newRecord.metadata === 'object' && newRecord.metadata !== null && !Array.isArray(newRecord.metadata)) 
            ? newRecord.metadata as Record<string, any>
            : {},
          created_at: newRecord.created_at,
          updated_at: newRecord.updated_at
        };

        setNotifications(prev => [typedNotification, ...prev.slice(0, 49)]);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      // Verificar se a notificação é para o usuário atual
      if (newRecord.user_id === user?.id) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === newRecord.id
              ? {
                  ...notification,
                  is_read: newRecord.is_read,
                  updated_at: newRecord.updated_at
                }
              : notification
          )
        );
      }
    } else if (eventType === 'DELETE' && oldRecord) {
      setNotifications(prev =>
        prev.filter(notification => notification.id !== oldRecord.id)
      );
    }
  }, [user?.id]);

  // Configurar subscrição em tempo real
  useRealTimeSubscription(
    {
      table: 'notifications',
      event: '*',
      filter: user ? `user_id=eq.${user.id}` : undefined
    },
    handleRealtimeUpdate
  );

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
