
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { CrudResult, formatCrudResult } from '@/integrations/supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData extends LoginCredentials {
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResult {
  user: User | null;
  error: any | null;
}

export const authCredentials = {
  login: async ({ email, password }: LoginCredentials): Promise<CrudResult<User | null>> => {
    try {
      console.log('[AuthCredentials] Iniciando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AuthCredentials] Erro no login:', error);
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthCredentials] Login bem-sucedido para:', data.user?.email);
      return formatCrudResult(data.user, null);
    } catch (error) {
      console.error('[AuthCredentials] Erro não tratado no login:', error);
      return formatCrudResult(null, error);
    }
  },
  
  signUp: async (credentials: UserRegistrationData): Promise<CrudResult<User | null>> => {
    try {
      console.log('[AuthCredentials] Iniciando registro para:', credentials.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName || credentials.name?.split(' ')[0] || '',
            last_name: credentials.lastName || 
              (credentials.name ? credentials.name.split(' ').slice(1).join(' ') : '')
          }
        }
      });
      
      if (error) {
        console.error('[AuthCredentials] Erro no registro:', error);
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthCredentials] Registro bem-sucedido para:', data.user?.email);
      return formatCrudResult(data.user, null);
    } catch (error) {
      console.error('[AuthCredentials] Erro não tratado no registro:', error);
      return formatCrudResult(null, error);
    }
  }
};
