
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  targetUserId: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  metadata?: Record<string, any>;
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

  // Criar notificação para todos os usuários (apenas admins)
  async createBroadcastNotification(params: Omit<CreateNotificationParams, 'targetUserId'>) {
    try {
      // Buscar todos os usuários (isso seria otimizado em produção)
      const { data: managers, error: managersError } = await supabase
        .from('managers')
        .select('user_id')
        .not('user_id', 'is', null);

      if (managersError) throw managersError;

      // Criar notificações para todos os usuários
      const notifications = managers?.map(manager => ({
        user_id: manager.user_id,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        metadata: params.metadata || {}
      })) || [];

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error creating broadcast notification:', error);
      return false;
    }
  },

  // Notificações específicas para eventos do sistema
  async notifyMetricAlert(userId: string, metricName: string, currentValue: number, targetValue: number) {
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
  }
};
