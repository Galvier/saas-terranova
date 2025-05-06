
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { authService } from '@/services/auth';

interface UseAuthMethodsReturn {
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthMethods = (): UseAuthMethodsReturn => {
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      console.log('[AuthMethods] Tentando login para:', email);
      
      // Usar serviço de autenticação em vez de chamar diretamente o Supabase
      const result = await authService.login({ email, password });
      
      if (result.error) {
        console.error('[AuthMethods] Erro durante login:', result.error);
        toast({
          title: "Erro no login",
          description: result.error.message || "Credenciais inválidas. Por favor, verifique seu email e senha.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log('[AuthMethods] Login bem-sucedido para:', email);
      return true;
    } catch (error: any) {
      console.error('[AuthMethods] Erro não tratado durante login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro ao fazer login. Por favor, tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsAuthenticating(true);
      console.log('[AuthMethods] Iniciando logout');
      
      const result = await authService.logout();
      
      if (result.error) {
        console.error('[AuthMethods] Erro durante logout:', result.error);
        toast({
          title: "Erro ao desconectar",
          description: result.error.message || "Falha ao fazer logout",
          variant: "destructive"
        });
      } else {
        console.log('[AuthMethods] Logout concluído com sucesso');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    isAuthenticating,
    login,
    logout
  };
};
