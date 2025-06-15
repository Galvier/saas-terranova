
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationFilters {
  type?: 'all' | 'info' | 'warning' | 'success' | 'error';
  status?: 'all' | 'read' | 'unread';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const useNotificationsDialog = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async (
    offset: number = 0,
    limit: number = 20,
    filters: NotificationFilters = {},
    reset: boolean = false
  ) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Aplicar filtros
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('is_read', filters.status === 'read');
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      const { data, error, count } = await query;

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

      if (reset) {
        setNotifications(typedNotifications);
      } else {
        setNotifications(prev => [...prev, ...typedNotifications]);
      }

      setTotalCount(count || 0);
      setHasMore(typedNotifications.length === limit);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const promises = notificationIds.map(id => 
        supabase.rpc('mark_notification_as_read', { notification_id: id })
      );
      
      await Promise.all(promises);

      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
    }
  }, []);

  return {
    notifications,
    isLoading,
    hasMore,
    totalCount,
    fetchNotifications,
    markAsRead,
    markMultipleAsRead,
    setNotifications
  };
};
