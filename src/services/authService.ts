
import { supabase } from '@/integrations/supabase/supabaseClient';
import { formatCrudResult, CrudResult } from '@/integrations/supabase/helpers';
import { User, Session } from '@supabase/supabase-js';

// Interface para dados do usuário no cadastro
export interface UserRegistrationData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'user';
}

// Interface para dados de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para resultados de autenticação
export interface AuthResult extends CrudResult<{user: User | null, session: Session | null}> {
  // Campos adicionais específicos para autenticação podem ser adicionados aqui
}

/**
 * Serviço de autenticação com métodos para registro, login e gerenciamento de sessão
 */
export const authService = {
  /**
   * Registra um novo usuário no sistema
   */
  async registerUser(userData: UserRegistrationData): Promise<AuthResult> {
    try {
      console.log('Iniciando processo de registro para:', userData.email);
      
      // Etapa 1: Cadastrar no Auth do Supabase
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
        console.error('Erro ao criar usuário no Auth:', authError);
        return {
          data: null,
          error: authError,
          status: 'error',
          message: authError.message || 'Erro ao criar usuário'
        };
      }
      
      console.log('Usuário registrado com sucesso no Auth:', authData.user?.id);
      
      // Não precisamos criar um perfil manualmente porque temos um trigger para isso no banco
      
      return {
        data: { user: authData.user, session: authData.session },
        error: null,
        status: 'success',
        message: 'Usuário registrado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro não tratado no registro:', error);
      return {
        data: null,
        error,
        status: 'error',
        message: error.message || 'Ocorreu um erro inesperado no registro'
      };
    }
  },
  
  /**
   * Realiza login do usuário no sistema
   */
  async loginUser({ email, password }: LoginCredentials): Promise<AuthResult> {
    try {
      console.log('Iniciando processo de login para:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('Erro ao realizar login:', authError);
        
        // Mensagens de erro específicas para melhorar a experiência do usuário
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
      
      console.log('Login realizado com sucesso:', authData.user?.id);
      
      return {
        data: { user: authData.user, session: authData.session },
        error: null,
        status: 'success',
        message: 'Login realizado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro não tratado no login:', error);
      return {
        data: null,
        error,
        status: 'error',
        message: error.message || 'Ocorreu um erro inesperado no login'
      };
    }
  },
  
  /**
   * Verifica se há uma sessão ativa
   */
  async getSession(): Promise<{session: Session | null, user: User | null}> {
    const { data } = await supabase.auth.getSession();
    return {
      session: data.session,
      user: data.session?.user || null
    };
  },
  
  /**
   * Encerra a sessão do usuário
   */
  async logout(): Promise<CrudResult<null>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao realizar logout:', error);
        return formatCrudResult(null, error);
      }
      
      console.log('Logout realizado com sucesso');
      return formatCrudResult(null, null);
    } catch (error) {
      console.error('Erro não tratado no logout:', error);
      return formatCrudResult(null, error);
    }
  },
  
  /**
   * Configura um listener para mudanças no estado de autenticação
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Mudança no estado de autenticação:', event);
      callback(event, session);
    });
  },
  
  /**
   * Verifica se o usuário tem permissão de admin
   */
  isAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.user_metadata?.role === 'admin';
  }
};
