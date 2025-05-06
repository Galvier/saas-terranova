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
      
      // Verificar conexão com Supabase antes de tentar login
      try {
        const { data: connectionTest } = await supabase.rpc('postgres_version');
        console.log('[AuthCredentials] Conexão Supabase OK:', connectionTest);
      } catch (connError) {
        console.error('[AuthCredentials] Erro na conexão com Supabase:', connError);
        return formatCrudResult(null, new Error('Erro de conexão com o servidor. Verifique sua conexão e tente novamente.'));
      }
      
      // Verificar se a tabela managers existe antes do login
      try {
        const { data: tableCheck } = await supabase.rpc('check_table_exists_and_count', {
          table_name: 'managers'
        });
        console.log('[AuthCredentials] Verificação da tabela managers:', tableCheck);
        
        if (!tableCheck || !(tableCheck as any).exists) {
          console.error('[AuthCredentials] Tabela managers não existe');
          return formatCrudResult(null, new Error('Configuração do banco de dados incompleta. A tabela de gerentes não existe.'));
        }
      } catch (tableError) {
        console.error('[AuthCredentials] Erro ao verificar tabela managers:', tableError);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AuthCredentials] Erro no login:', error);
        
        // Tradução de erros comuns do Supabase Auth
        if (error.message.includes('Invalid login credentials')) {
          return formatCrudResult(null, new Error('Credenciais inválidas. Verifique seu email e senha.'));
        }
        if (error.message.includes('Email not confirmed')) {
          return formatCrudResult(null, new Error('Email não confirmado. Verifique sua caixa de entrada.'));
        }
        
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthCredentials] Login bem-sucedido para:', data.user?.email);
      return formatCrudResult(data.user, null);
    } catch (error) {
      console.error('[AuthCredentials] Erro não tratado no login:', error);
      return formatCrudResult(null, error);
    }
  },
  
  diagnoseLoginIssue: async (): Promise<CrudResult<any>> => {
    try {
      // Verificação da conexão
      console.log('[AuthCredentials] Executando diagnóstico de login...');
      
      const connectionTest = await supabase.rpc('postgres_version');
      console.log('[AuthCredentials] Teste de conexão:', connectionTest);
      
      // Verificação das tabelas necessárias
      const tablesCheck = {
        managers: await supabase.rpc('check_table_exists_and_count', { table_name: 'managers' }),
        departments: await supabase.rpc('check_table_exists_and_count', { table_name: 'departments' })
      };
      console.log('[AuthCredentials] Verificação de tabelas:', tablesCheck);
      
      // Verificação de funções RPC - Removendo a verificação de funções que não existem
      const functionsCheck = {
        sync_auth_user_to_manager: { error: "Verificação não disponível" },
        sync_manager_to_auth_user: { error: "Verificação não disponível" }
      };
      
      // Resultado do diagnóstico
      const diagnosticResult = {
        connection: connectionTest,
        tables: tablesCheck,
        functions: functionsCheck,
        timestamp: new Date().toISOString()
      };
      
      return formatCrudResult(diagnosticResult, null);
    } catch (error) {
      console.error('[AuthCredentials] Erro no diagnóstico de login:', error);
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
              (credentials.name ? credentials.name.split(' ').slice(1).join(' ') : ''),
            role: 'admin' // Define o tipo de usuário como admin para registro de primeiro acesso
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
