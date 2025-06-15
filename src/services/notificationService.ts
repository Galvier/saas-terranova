
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  targetUserId: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateParams {
  name: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: string;
  is_active?: boolean;
}

export interface BroadcastParams {
  templateId: string;
  targetType: 'all' | 'admins' | 'department';
  departmentId?: string;
  variables?: Record<string, any>;
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
  },

  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Map the Supabase response to our typed interface
      const typedTemplates: NotificationTemplate[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        title: item.title,
        message: item.message,
        type: item.type as 'info' | 'warning' | 'success' | 'error',
        category: item.category,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return typedTemplates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  async createTemplate(params: CreateTemplateParams): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          name: params.name,
          title: params.title,
          message: params.message,
          type: params.type,
          category: params.category,
          is_active: params.is_active ?? true
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  },

  async broadcastFromTemplate(params: BroadcastParams): Promise<number | null> {
    try {
      const { data, error } = await supabase.rpc('broadcast_notification_from_template', {
        template_id_param: params.templateId,
        target_type: params.targetType,
        department_id_param: params.departmentId || null,
        variables: params.variables || {}
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return null;
    }
  }
};
