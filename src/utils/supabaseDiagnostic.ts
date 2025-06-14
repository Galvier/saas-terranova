
import { supabase } from '@/integrations/supabase/client';

// Interface para os resultados de diagnóstico
export interface DiagnosticResult {
  status: 'success' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
}

// Interface para informações de conexão
export interface ConnectionInfo {
  connected: boolean;
  url: string;
  responseTime: number;
  timestamp: Date;
  error?: string;
  success?: boolean; // Adicionado para compatibilidade com Settings.tsx
  message?: string; // Adicionado para compatibilidade com Settings.tsx
}

// Interface para informações de tabela
export interface TableInfo {
  name: string;
  status: 'ok' | 'empty' | 'error';
  recordCount: number | null;
  message?: string;
  exists?: boolean; // Adicionado para compatibilidade com Settings.tsx
}

// Função para testar a conexão com o Supabase
export async function testConnection(): Promise<ConnectionInfo> {
  const startTime = performance.now();
  try {
    const url = getSupabaseUrlUtil();
    const { data, error } = await supabase.rpc('postgres_version');
    
    if (error) throw error;
    
    return {
      connected: true,
      url,
      responseTime: Math.round(performance.now() - startTime),
      timestamp: new Date(),
      success: true // Adicionado para compatibilidade com Settings.tsx
    };
  } catch (error: any) {
    console.error('Erro na conexão:', error);
    return {
      connected: false,
      url: getSupabaseUrlUtil(),
      responseTime: Math.round(performance.now() - startTime),
      timestamp: new Date(),
      error: error.message || 'Erro desconhecido na conexão',
      success: false, // Adicionado para compatibilidade com Settings.tsx
      message: error.message || 'Erro desconhecido na conexão' // Adicionado para compatibilidade com Settings.tsx
    };
  }
}

// Função para verificar o status das tabelas
export async function checkTables(essentialTables: string[]): Promise<TableInfo[]> {
  const results: TableInfo[] = [];
  
  for (const tableName of essentialTables) {
    try {
      const { data, error } = await supabase.rpc('check_table_exists_and_count', {
        table_name: tableName
      });
      
      if (error) {
        results.push({
          name: tableName,
          status: 'error',
          recordCount: null,
          message: error.message
        });
        continue;
      }
      
      // Converter o resultado para o formato esperado
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!result.exists) {
        results.push({
          name: tableName,
          status: 'error',
          recordCount: null,
          message: 'Tabela não encontrada',
          exists: false
        });
      } else if (result.count === 0) {
        results.push({
          name: tableName,
          status: 'empty',
          recordCount: 0,
          message: 'Tabela está vazia',
          exists: true
        });
      } else {
        results.push({
          name: tableName,
          status: 'ok',
          recordCount: result.count,
          message: null,
          exists: true
        });
      }
    } catch (error: any) {
      results.push({
        name: tableName,
        status: 'error',
        recordCount: null,
        message: error.message || 'Erro ao verificar tabela',
        exists: false
      });
    }
  }
  
  return results;
}

// Função para executar teste de escrita
export async function testDiagnosticWrite(): Promise<DiagnosticResult> {
  const testId = `test-${new Date().getTime()}`;
  
  try {
    // Primeiro, criar a tabela de diagnóstico se não existir
    await supabase.rpc('create_diagnostic_table_if_not_exists');
    
    // Agora, testar a escrita
    const { data, error } = await supabase.rpc('run_diagnostic_write_test', {
      test_id_param: testId
    });
    
    if (error) throw error;
    
    return {
      status: 'success',
      message: 'Teste de escrita realizado com sucesso',
      timestamp: new Date(),
      details: data
    };
  } catch (error: any) {
    console.error('Erro no teste de escrita:', error);
    return {
      status: 'error',
      message: error.message || 'Erro desconhecido no teste de escrita',
      timestamp: new Date()
    };
  }
}

// Função para verificar sincronização entre managers e dados de autenticação
export async function checkAuthUsersSyncStatus(): Promise<DiagnosticResult> {
  try {
    const { data, error } = await supabase.rpc('diagnose_auth_sync_issues');
    
    if (error) throw error;
    
    return {
      status: 'success',
      message: 'Verificação de sincronização concluída - usando dados seguros dos managers',
      timestamp: new Date(),
      details: data
    };
  } catch (error: any) {
    console.error('Erro ao verificar sincronização:', error);
    return {
      status: 'error',
      message: error.message || 'Erro ao verificar sincronização',
      timestamp: new Date()
    };
  }
}

// Função para obter a URL do Supabase para diagnóstico
export function getSupabaseUrlUtil(): string {
  return import.meta.env.VITE_SUPABASE_URL || 'https://wjuzzjitpkhjjxujxftm.supabase.co';
}

// Função principal de diagnóstico que executa todos os testes
export async function runFullDiagnostic(essentialTables: string[]) {
  const connection = await testConnection();
  const tables = await checkTables(essentialTables);
  const writeTest = await testDiagnosticWrite();
  const syncStatus = await checkAuthUsersSyncStatus();
  
  return {
    connection,
    tables,
    writeTest,
    syncStatus
  };
}

// Funções para compatibilidade com Settings.tsx
export const testTables = async () => {
  // Lista de tabelas seguras que podemos verificar (sem auth.users)
  const essentialTables = [
    'profiles',
    'departments',
    'managers',
    'settings',
    'user_settings',
    'logs',
    'admin_dashboard_config',
    'metrics_definition',
    'metrics_values',
    'notifications',
    'notification_settings',
    'notification_templates',
    'metric_justifications',
    'backup_settings',
    'backup_history',
    'backup_data',
    'push_subscriptions',
    'scheduled_notifications',
    'department_managers',
    'diagnostic_tests'
  ];
  
  const tablesResult = await checkTables(essentialTables);
  
  // Converter para o formato esperado pelo Settings.tsx
  const result: Record<string, { exists: boolean, count?: number }> = {};
  
  tablesResult.forEach(table => {
    result[table.name] = {
      exists: table.status !== 'error',
      count: table.recordCount || 0
    };
  });
  
  return result;
};

export const testDatabaseWrite = async (): Promise<DiagnosticResult> => {
  return await testDiagnosticWrite();
};
