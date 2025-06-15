
import { supabase } from '@/integrations/supabase/client';

export interface DirectBroadcastParams {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetType: 'all' | 'admins' | 'department';
  departmentId?: string;
  variables?: Record<string, any>;
}

export interface BroadcastUser {
  user_id: string;
  name: string;
}

export const directBroadcastService = {
  async getTargetUsers(targetType: string, departmentId?: string): Promise<BroadcastUser[]> {
    let query = supabase
      .from('managers')
      .select('user_id, name')
      .not('user_id', 'is', null)
      .eq('is_active', true);

    switch (targetType) {
      case 'admins':
        query = query.eq('role', 'admin');
        break;
      case 'department':
        if (departmentId) {
          query = query.eq('department_id', departmentId);
        }
        break;
      case 'all':
      default:
        // Sem filtro adicional para 'all'
        break;
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching target users:', error);
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    return data || [];
  },

  processVariables(text: string, variables: Record<string, any>, userName?: string): string {
    let processedText = text;

    // Processar variáveis personalizadas
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedText = processedText.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Processar variáveis padrão
    if (userName) {
      processedText = processedText.replace(/\{\{user_name\}\}/g, userName);
    }

    processedText = processedText.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString('pt-BR'));
    processedText = processedText.replace(/\{\{current_period\}\}/g, new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }));

    return processedText;
  },

  async sendDirectBroadcast(params: DirectBroadcastParams): Promise<number> {
    const { title, message, type, targetType, departmentId, variables = {} } = params;

    console.log('Starting direct broadcast...', params);

    // Buscar usuários destinatários
    const targetUsers = await this.getTargetUsers(targetType, departmentId);
    
    if (targetUsers.length === 0) {
      console.warn('No target users found for broadcast');
      return 0;
    }

    console.log(`Found ${targetUsers.length} target users`);

    let successCount = 0;
    const errors: string[] = [];

    // Enviar notificação para cada usuário
    for (const user of targetUsers) {
      try {
        const processedTitle = this.processVariables(title, variables, user.name);
        const processedMessage = this.processVariables(message, variables, user.name);

        const { data, error } = await supabase.rpc('create_notification', {
          target_user_id: user.user_id,
          notification_title: processedTitle,
          notification_message: processedMessage,
          notification_type: type,
          notification_metadata: {
            broadcast_type: targetType,
            department_id: departmentId,
            processed_variables: variables,
            direct_broadcast: true
          }
        });

        if (error) {
          console.error(`Error creating notification for user ${user.name}:`, error);
          errors.push(`${user.name}: ${error.message}`);
        } else {
          console.log(`Notification sent successfully to ${user.name}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Exception sending notification to user ${user.name}:`, error);
        errors.push(`${user.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some notifications failed:', errors);
      if (successCount === 0) {
        throw new Error(`Todas as notificações falharam. Primeiros erros: ${errors.slice(0, 3).join('; ')}`);
      }
    }

    console.log(`Direct broadcast completed. Success: ${successCount}, Errors: ${errors.length}`);
    return successCount;
  }
};
