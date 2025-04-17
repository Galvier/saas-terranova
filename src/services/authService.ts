
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
      console.log('[AuthService] Iniciando processo de registro para:', userData.email);
      
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
      
      console.log('[AuthService] Resultado do signUp:', authData ? 'Sucesso' : 'Falha', authError ? authError.message : '');
      
      if (authError) {
        console.error('[AuthService] Erro ao criar usuário no Auth:', authError);
        
        // Mensagens de erro específicas
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
      
      if (!authData.user) {
        console.error('[AuthService] Usuário não criado no Auth');
        return {
          data: null,
          error: new Error('Falha ao criar usuário'),
          status: 'error',
          message: 'Falha ao criar usuário'
        };
      }
      
      console.log('[AuthService] Usuário registrado com sucesso no Auth:', authData.user.id);
      
      // O perfil é criado automaticamente através de um trigger no banco de dados
      
      return {
        data: { user: authData.user, session: authData.session },
        error: null,
        status: 'success',
        message: 'Usuário registrado com sucesso'
      };
    } catch (error: any) {
      console.error('[AuthService] Erro não tratado no registro:', error);
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
      console.log('[AuthService] Iniciando processo de login para:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('[AuthService] Resultado do signInWithPassword:', authData ? 'Sucesso' : 'Falha', authError ? authError.message : '');
      
      if (authError) {
        console.error('[AuthService] Erro ao realizar login:', authError);
        
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
      
      console.log('[AuthService] Login realizado com sucesso:', authData.user?.id);
      
      return {
        data: { user: authData.user, session: authData.session },
        error: null,
        status: 'success',
        message: 'Login realizado com sucesso'
      };
    } catch (error: any) {
      console.error('[AuthService] Erro não tratado no login:', error);
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
    try {
      console.log('[AuthService] Verificando sessão ativa');
      const { data } = await supabase.auth.getSession();
      
      console.log('[AuthService] Sessão encontrada:', data.session ? 'Sim' : 'Não');
      
      return {
        session: data.session,
        user: data.session?.user || null
      };
    } catch (error) {
      console.error('[AuthService] Erro ao verificar sessão:', error);
      return { session: null, user: null };
    }
  },
  
  /**
   * Encerra a sessão do usuário
   */
  async logout(): Promise<CrudResult<null>> {
    try {
      console.log('[AuthService] Iniciando processo de logout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthService] Erro ao realizar logout:', error);
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthService] Logout realizado com sucesso');
      return formatCrudResult(null, null);
    } catch (error) {
      console.error('[AuthService] Erro não tratado no logout:', error);
      return formatCrudResult(null, error);
    }
  },
  
  /**
   * Configura um listener para mudanças no estado de autenticação
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    console.log('[AuthService] Configurando listener para mudanças de autenticação');
    
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthService] Mudança no estado de autenticação:', event);
      callback(event, session);
    });
  },
  
  /**
   * Verifica se o usuário tem permissão de admin
   */
  isAdmin(user: User | null): boolean {
    if (!user) return false;
    const isAdmin = user.user_metadata?.role === 'admin';
    console.log('[AuthService] Verificação de admin para usuário:', user.id, 'Resultado:', isAdmin);
    return isAdmin;
  },
  
  /**
   * Reseta a senha do usuário
   */
  async resetPassword(email: string): Promise<CrudResult<null>> {
    try {
      console.log('[AuthService] Iniciando processo de reset de senha para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        console.error('[AuthService] Erro ao solicitar reset de senha:', error);
        return {
          data: null,
          error,
          status: 'error',
          message: error.message || 'Erro ao solicitar reset de senha'
        };
      }
      
      console.log('[AuthService] Solicitação de reset de senha enviada com sucesso');
      return {
        data: null,
        error: null,
        status: 'success',
        message: 'Link para redefinição de senha enviado para seu email'
      };
    } catch (error) {
      console.error('[AuthService] Erro não tratado no reset de senha:', error);
      return formatCrudResult(null, error);
    }
  }
};
