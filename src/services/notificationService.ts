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

export interface FrequencyConfig {
  daily?: { reminder_hour: number; };
  weekly?: { reminder_day: number; reminder_hour: number; };
  monthly?: { deadline_day: number; reminder_days: number[]; };
  quarterly?: { reminder_days_before: number[]; };
  yearly?: { reminder_days_before: number[]; };
}

export const notificationService = {
  async createNotification(params: CreateNotificationParams): Promise<string | null> {
    try {
      console.log('Creating notification:', params);
      const { data, error } = await supabase.rpc('create_notification', {
        target_user_id: params.targetUserId,
        notification_title: params.title,
        notification_message: params.message,
        notification_type: params.type || 'info',
        notification_metadata: params.metadata || {}
      });

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
      
      console.log('Notification created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  async processAutomaticNotifications(): Promise<any> {
    try {
      console.log('Processing automatic notifications...');
      const { data, error } = await supabase.functions.invoke('automatic-notifications');
      
      if (error) {
        console.error('Error processing automatic notifications:', error);
        throw error;
      }
      
      console.log('Automatic notifications processed:', data);
      return data;
    } catch (error) {
      console.error('Error processing automatic notifications:', error);
      throw error;
    }
  },

  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      console.log('Fetching notification templates...');
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
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
      
      console.log('Templates fetched successfully:', typedTemplates.length);
      return typedTemplates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  async createTemplate(params: CreateTemplateParams): Promise<string | null> {
    try {
      console.log('Creating template:', params);
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

      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }
      
      console.log('Template created successfully:', data?.id);
      return data?.id || null;
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  },

  async broadcastFromTemplate(params: BroadcastParams): Promise<number | null> {
    try {
      console.log('Broadcasting notification with params:', params);
      
      // Verificar se o template existe antes de tentar fazer broadcast
      const { data: templateCheck, error: templateError } = await supabase
        .from('notification_templates')
        .select('id, name, is_active')
        .eq('id', params.templateId)
        .single();

      if (templateError || !templateCheck) {
        console.error('Template not found:', templateError);
        throw new Error('Template não encontrado');
      }

      if (!templateCheck.is_active) {
        console.error('Template is not active:', templateCheck);
        // Para templates temporários, permitir mesmo se não ativo
        if (!templateCheck.name.startsWith('temp_')) {
          throw new Error('Template não está ativo');
        }
      }

      console.log('Template validated:', templateCheck);
      
      const { data, error } = await supabase.rpc('broadcast_notification_from_template', {
        template_id_param: params.templateId,
        target_type: params.targetType,
        department_id_param: params.departmentId || null,
        variables: params.variables || {}
      });

      if (error) {
        console.error('Error broadcasting notification:', error);
        throw error;
      }
      
      console.log('Broadcast completed successfully. Notification count:', data);
      return data;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  },

  async getFrequencyConfigs(): Promise<FrequencyConfig> {
    try {
      console.log('Fetching frequency configurations...');
      const { data, error } = await supabase
        .from('notification_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'daily_reminder_config',
          'weekly_reminder_config',
          'monthly_reminder_config',
          'quarterly_reminder_config',
          'yearly_reminder_config'
        ]);

      if (error) {
        console.error('Error fetching frequency configs:', error);
        return this.getDefaultFrequencyConfigs();
      }

      const configs: FrequencyConfig = {};
      if (data) {
        for (const setting of data) {
          const key = setting.setting_key.replace('_reminder_config', '') as keyof FrequencyConfig;
          configs[key] = setting.setting_value as any;
        }
      }

      // Preencher com valores padrão se necessário
      return { ...this.getDefaultFrequencyConfigs(), ...configs };
    } catch (error) {
      console.error('Error fetching frequency configs:', error);
      return this.getDefaultFrequencyConfigs();
    }
  },

  async updateFrequencyConfig(frequency: keyof FrequencyConfig, config: any): Promise<boolean> {
    try {
      console.log('Updating frequency config:', frequency, config);
      const { error } = await supabase.rpc('update_notification_setting', {
        setting_key_param: `${frequency}_reminder_config`,
        new_value: config
      });

      if (error) {
        console.error('Error updating frequency config:', error);
        throw error;
      }

      console.log('Frequency config updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating frequency config:', error);
      return false;
    }
  },

  getDefaultFrequencyConfigs(): FrequencyConfig {
    return {
      daily: { reminder_hour: 18 }, // 6 PM
      weekly: { reminder_day: 1, reminder_hour: 9 }, // Segunda-feira 9 AM
      monthly: { deadline_day: 25, reminder_days: [3, 5, 7] },
      quarterly: { reminder_days_before: [7, 15, 30] },
      yearly: { reminder_days_before: [15, 30, 60] }
    };
  },

  translateFrequency(frequency: string): string {
    const translations: Record<string, string> = {
      'daily': 'Diária',
      'weekly': 'Semanal',
      'monthly': 'Mensal',
      'quarterly': 'Trimestral',
      'yearly': 'Anual'
    };
    return translations[frequency] || frequency;
  }
};
