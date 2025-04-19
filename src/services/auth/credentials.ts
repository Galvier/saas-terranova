
import { supabase } from '@/integrations/supabase/client';
import { CrudResult } from '@/integrations/supabase/helpers';
import { User, Session } from '@supabase/supabase-js';

export interface UserRegistrationData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult extends CrudResult<{user: User | null, session: Session | null}> {}

export const authCredentials = {
  register: async (userData: UserRegistrationData): Promise<AuthResult> => {
    try {
      console.log('[AuthCredentials] Iniciando processo de registro para:', userData.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'user'
          }
        }
      });
      
      if (authError) {
        console.error('[AuthCredentials] Erro ao criar usuário:', authError);
        
        let errorMessage = 'Erro ao criar usuário';
        if (authError.message.includes('already registered')) {
          errorMessage = 'Este email já está registrado';
        } else if (authError.message.includes('password')) {
          errorMessage = 'A senha não atende aos critérios de segurança';
        }
        
        return {
          data: null,
          error: authError,
          status: 'error',
          message: errorMessage
        };
      }
      
      return {
        data: { user: authData.user, session: authData.session },
        error: null,
        status: 'success',
        message: 'Usuário registrado com sucesso'
      };
    } catch (error: any) {
      console.error('[AuthCredentials] Erro não tratado no registro:', error);
      return {
        data: null,
        error,
        status: 'error',
        message: error.message || 'Ocorreu um erro inesperado no registro'
      };
    }
  },

  login: async ({ email, password }: LoginCredentials): Promise<AuthResult> => {
    try {
      console.log('[AuthCredentials] Iniciando processo de login para:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('[AuthCredentials] Erro ao realizar login:', authError);
        
        let errorMessage = 'Falha no login';
        if (authError.message.includes('Invalid login')) {
          errorMessage = 'Email ou senha inválidos';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada';
        }
        
        return {
          data: null,
          error: authError,
          status: 'error',
          message: errorMessage
        };
      }
      
      return {
        data: { user: authData.user, session: authData.session },
        error: null,
        status: 'success',
        message: 'Login realizado com sucesso'
      };
    } catch (error: any) {
      console.error('[AuthCredentials] Erro não tratado no login:', error);
      return {
        data: null,
        error,
        status: 'error',
        message: error.message || 'Ocorreu um erro inesperado no login'
      };
    }
  }
};
