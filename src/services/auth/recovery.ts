
import { supabase } from '@/integrations/supabase/client';
import { CrudResult } from '@/integrations/supabase/helpers';

export const authRecovery = {
  resetPassword: async (email: string): Promise<CrudResult<null>> => {
    try {
      console.log('[AuthRecovery] Iniciando processo de reset de senha para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        console.error('[AuthRecovery] Erro ao solicitar reset de senha:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: error.message || 'Erro ao solicitar reset de senha'
        };
      }
      
      console.log('[AuthRecovery] Solicitação de reset de senha enviada com sucesso');
      return {
        data: null,
        error: null,
        status: 'success',
        message: 'Link para redefinição de senha enviado para seu email'
      };
    } catch (error) {
      console.error('[AuthRecovery] Erro não tratado no reset de senha:', error);
      return {
        data: null,
        error,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao solicitar reset de senha'
      };
    }
  }
};
