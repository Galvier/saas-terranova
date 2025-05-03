
import { supabase } from '@/integrations/supabase/client';
import { formatCrudResult, type CrudResult } from '@/integrations/supabase';

/**
 * Set of authentication recovery services
 */
export const authRecovery = {
  /**
   * Request a password reset email
   */
  requestPasswordReset: async (email: string): Promise<CrudResult<null>> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Error requesting password reset:', error);
        return formatCrudResult(null, error);
      }

      return {
        data: null,
        error: false,
        message: 'Foi enviado um email de recuperação de senha. Por favor, verifique sua caixa de entrada.',
      };
    } catch (error) {
      console.error('Exception requesting password reset:', error);
      return formatCrudResult(null, error);
    }
  },

  /**
   * Reset password with token from email
   */
  resetPassword: async (newPassword: string): Promise<CrudResult<null>> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Error resetting password:', error);
        return formatCrudResult(null, error);
      }

      return {
        data: null,
        error: false,
        message: 'Senha alterada com sucesso. Você pode fazer login agora.',
      };
    } catch (error) {
      console.error('Exception resetting password:', error);
      return formatCrudResult(null, error);
    }
  },
};
