
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  targetUserId: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  metadata?: Record<string, any>;
}

export interface BroadcastParams {
  templateId: string;
  targetType: 'all' | 'admins' | 'department';
  departmentId?: string;
  variables?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: string;
  is_active: boolean;
}

export interface ScheduledNotification {
  id: string;
  template_id: string;
  target_type: 'user' | 'department' | 'all' | 'admins';
  target_id?: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'once';
  schedule_time?: string;
  schedule_day?: number;
  scheduled_for?: string;
  is_active: boolean;
  last_sent_at?: string;
}

export const notificationService = {
  // Criar notificação para um usuário específico
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

  // Broadcast usando template
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
  },

  // Criar notificação usando template
  async createFromTemplate(templateId: string, userId: string, variables?: Record<string, any>): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_notification_from_template', {
        template_id_param: templateId,
        target_user_id: userId,
        variables: variables || {}
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification from template:', error);
      return null;
    }
  },

  // Gerenciar templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      
      // Garantir que os tipos sejam compatíveis
      return (data || []).map(template => ({
        ...template,
        type: template.type as 'info' | 'warning' | 'success' | 'error'
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  async createTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert([template])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  },

  async updateTemplate(id: string, template: Partial<NotificationTemplate>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({ ...template, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  },

  // Gerenciar agendamentos
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Garantir que os tipos sejam compatíveis
      return (data || []).map(notification => ({
        ...notification,
        target_type: notification.target_type as 'user' | 'department' | 'all' | 'admins',
        schedule_type: notification.schedule_type as 'daily' | 'weekly' | 'monthly' | 'once'
      }));
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      return [];
    }
  },

  async createScheduledNotification(schedule: Omit<ScheduledNotification, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .insert([schedule])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating scheduled notification:', error);
      return null;
    }
  },

  // Push Notifications
  async subscribeToPush(subscription: PushSubscription): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert([{
          user_id: (await supabase.auth.getUser()).data.user?.id,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          is_active: true
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return false;
    }
  },

  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Processar notificações automáticas manualmente
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

  // Notificações específicas usando templates
  async notifyMetricAlert(userId: string, metricName: string, currentValue: number, targetValue: number) {
    // Buscar template de alerta de métrica
    const templates = await this.getTemplates();
    const template = templates.find(t => t.category === 'metric_alert' && t.is_active);
    
    if (template) {
      return this.createFromTemplate(template.id, userId, {
        metric_name: metricName,
        current_value: currentValue,
        target_value: targetValue
      });
    }
    
    // Fallback para notificação direta
    return this.createNotification({
      targetUserId: userId,
      title: 'Alerta de Métrica',
      message: `A métrica "${metricName}" está fora do alvo. Valor atual: ${currentValue}, Meta: ${targetValue}`,
      type: 'warning',
      metadata: {
        metric_name: metricName,
        current_value: currentValue,
        target_value: targetValue,
        alert_type: 'metric_alert'
      }
    });
  },

  async notifyBackupCompleted(userId: string, filename: string) {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.category === 'backup' && t.is_active);
    
    if (template) {
      return this.createFromTemplate(template.id, userId, {
        filename
      });
    }
    
    return this.createNotification({
      targetUserId: userId,
      title: 'Backup Concluído',
      message: `Backup automático realizado com sucesso: ${filename}`,
      type: 'success',
      metadata: {
        filename,
        alert_type: 'backup_completed'
      }
    });
  },

  async notifyNewUser(adminUserId: string, newUserName: string) {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.name === 'new_user_default' && t.is_active);
    
    if (template) {
      return this.createFromTemplate(template.id, adminUserId, {
        new_user_name: newUserName
      });
    }
    
    return this.createNotification({
      targetUserId: adminUserId,
      title: 'Novo Usuário Cadastrado',
      message: `${newUserName} foi cadastrado no sistema`,
      type: 'info',
      metadata: {
        new_user_name: newUserName,
        alert_type: 'new_user'
      }
    });
  },

  // Nova função específica para notificação de revisão de justificativa
  async notifyJustificationNeedsRevision(userId: string, metricName: string, periodDate: string, adminFeedback: string) {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.name === 'justification_needs_revision' && t.is_active);
    
    if (template) {
      return this.createFromTemplate(template.id, userId, {
        metric_name: metricName,
        period_date: periodDate,
        admin_feedback: adminFeedback
      });
    }
    
    // Fallback para notificação direta
    return this.createNotification({
      targetUserId: userId,
      title: 'Justificativa Devolvida para Revisão',
      message: `Sua justificativa para a métrica "${metricName}" do período ${periodDate} foi devolvida para revisão. Feedback: ${adminFeedback}`,
      type: 'warning',
      metadata: {
        metric_name: metricName,
        period_date: periodDate,
        admin_feedback: adminFeedback,
        alert_type: 'justification_revision'
      }
    });
  }
};
