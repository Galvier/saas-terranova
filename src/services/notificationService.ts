
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  targetUserId: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  metadata?: Record<string, any>;
}

export const notificationService = {
  async createNotification(params: CreateNotificationParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        target_user_id: params.targetUserId,
        notification_title: params.title,
        notification_message: params.message,
        notification_type: params.type || 'info',
        notification_metadata: params.metadata || {}
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  async processAutomaticNotifications(): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('automatic-notifications');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing automatic notifications:', error);
      throw error;
    }
  }
};
