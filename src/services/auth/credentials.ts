
import { supabase } from '@/integrations/supabase/client';
import { formatCrudResult, type CrudResult } from '@/integrations/supabase/core';
import { createLog } from '@/services/logService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface AuthResult {
  user: any;
  session: any;
}

export const authCredentials = {
  login: async (credentials: LoginCredentials): Promise<CrudResult<AuthResult>> => {
    try {
      console.log('[AuthCredentials] Iniciando login com:', credentials.email);
      
      // Log de tentativa de login
      await createLog('info', 'Tentativa de login', { 
        email: credentials.email,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error('[AuthCredentials] Erro no login:', error);
        
        // Log de erro no login
        await createLog('error', 'Erro no login', { 
          email: credentials.email,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthCredentials] Login bem-sucedido para:', credentials.email);
      
      // Log de login bem-sucedido
      await createLog('info', 'Login bem-sucedido', { 
        email: credentials.email,
        user_id: data.user?.id,
        timestamp: new Date().toISOString()
      }, data.user?.id);
      
      return formatCrudResult({
        user: data.user,
        session: data.session
      }, null);
    } catch (error) {
      console.error('[AuthCredentials] Erro não tratado no login:', error);
      
      // Log de erro não tratado
      await createLog('error', 'Erro não tratado no login', { 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      
      return formatCrudResult(null, error instanceof Error ? error : new Error(String(error)));
    }
  },

  register: async (userData: UserRegistrationData): Promise<CrudResult<AuthResult>> => {
    try {
      console.log('[AuthCredentials] Iniciando registro para:', userData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            display_name: userData.name,
            role: userData.role || 'user'
          }
        }
      });
      
      if (error) {
        console.error('[AuthCredentials] Erro no registro:', error);
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthCredentials] Registro bem-sucedido para:', userData.email);
      
      return formatCrudResult({
        user: data.user,
        session: data.session
      }, null);
    } catch (error) {
      console.error('[AuthCredentials] Erro não tratado no registro:', error);
      return formatCrudResult(null, error instanceof Error ? error : new Error(String(error)));
    }
  }
};
