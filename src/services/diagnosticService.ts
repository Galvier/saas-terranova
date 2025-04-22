
import { CrudResult, formatCrudResult, callRPC, RpcFunctionName } from '@/integrations/supabase/helpers';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseUrl } from '@/integrations/supabase/helpers';

export interface DiagnosticResult {
  status: "success" | "error";
  message: string;
  details?: any;
  timestamp: Date;
}

export interface TableInfo {
  name: string;
  recordCount: number | null;
  status: "ok" | "error" | "empty";
  message?: string;
}

export interface ConnectionInfo {
  url: string;
  responseTime: number;
  connected: boolean;
  timestamp: Date;
}

export const diagnosticService = {
  // Testa conexão básica com Supabase
  async testConnection(): Promise<ConnectionInfo> {
    const startTime = performance.now();
    let connected = false;

    try {
      // Consulta simples para testar conexão
      const { data, error } = await callRPC('postgres_version', {});
      
      if (error) throw error;
      
      connected = true;
      return {
        url: getSupabaseUrl(),
        responseTime: Math.round(performance.now() - startTime),
        connected,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        url: getSupabaseUrl(),
        responseTime: Math.round(performance.now() - startTime),
        connected: false,
        timestamp: new Date()
      };
    }
  },

  // Verifica se uma tabela existe
  async checkTable(tableName: string): Promise<TableInfo> {
    try {
      // Cria uma consulta SQL para verificar se a tabela existe e contar linhas
      const { data, error } = await callRPC<{exists: boolean; count: number}>('check_table_exists_and_count', {
        table_name: tableName
      });

      if (error) {
        return {
          name: tableName,
          recordCount: null,
          status: "error",
          message: error.message
        };
      }

      // Trata a resposta com base na estrutura do resultado RPC
      if (!data) {
        return {
          name: tableName,
          recordCount: null,
          status: "error",
          message: "No data returned from check"
        };
      }

      if (!data.exists) {
        return {
          name: tableName,
          recordCount: null,
          status: "error",
          message: "Table does not exist"
        };
      }

      return {
        name: tableName,
        recordCount: data.count,
        status: data.count === 0 ? "empty" : "ok"
      };
    } catch (error: any) {
      console.error(`Error checking table ${tableName}:`, error);
      return {
        name: tableName,
        recordCount: null,
        status: "error",
        message: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Executa um teste de escrita básico em uma tabela de teste
  async testWriteOperation(): Promise<DiagnosticResult> {
    const testId = `test-${Date.now()}`;
    
    try {
      // Cria tabela de diagnóstico se não existir
      await callRPC('create_diagnostic_table_if_not_exists', {});
      
      // Usa um procedimento armazenado para o teste
      const { data, error } = await callRPC('run_diagnostic_write_test', {
        test_id_param: testId
      });
      
      if (error) throw error;

      return {
        status: "success",
        message: "Write test completed successfully",
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('Write test failed:', error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        details: error,
        timestamp: new Date()
      };
    }
  },

  // Verifica todas as tabelas essenciais
  async checkAllTables(tableNames: string[]): Promise<TableInfo[]> {
    const results: TableInfo[] = [];
    
    for (const tableName of tableNames) {
      const result = await this.checkTable(tableName);
      results.push(result);
    }
    
    return results;
  },

  // Obtém diagnóstico completo
  async runFullDiagnostic(tableNames: string[]): Promise<{
    connection: ConnectionInfo;
    tables: TableInfo[];
    writeTest: DiagnosticResult;
  }> {
    const connection = await this.testConnection();
    const tables = await this.checkAllTables(tableNames);
    const writeTest = await this.testWriteOperation();
    
    return {
      connection,
      tables,
      writeTest
    };
  },

  // Verifica integridade dos dados de perfil de usuário
  async checkUserProfile(): Promise<CrudResult<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return formatCrudResult(false, { message: "Usuário não autenticado" });
      }
      
      // Since we cannot query profiles directly due to type limitations,
      // we'll use a more generic approach with proper typing
      try {
        const { data, error } = await callRPC<boolean>('check_user_profile', { 
          user_id: user.id 
        });
        
        if (error) {
          return formatCrudResult(false, error);
        }
        
        return formatCrudResult(Boolean(data), null);
      } catch (error) {
        return formatCrudResult(false, error);
      }
    } catch (error) {
      return formatCrudResult(false, error);
    }
  }
};
