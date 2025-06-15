
import { supabase } from '@/integrations/supabase/client';
import { formatCrudResult, type CrudResult } from '@/integrations/supabase/core';

export interface LogEntry {
  id: string;
  level: string;
  message: string;
  details?: any;
  user_id?: string;
  created_at: string;
}

export const createLog = async (
  level: 'info' | 'warning' | 'error',
  message: string,
  details?: any,
  user_id?: string
): Promise<CrudResult<LogEntry>> => {
  try {
    console.log(`[LogService] Criando log: ${level} - ${message}`);
    
    // Usar a função RPC create_security_log para criação segura
    const { data, error } = await supabase.rpc('create_security_log', {
      log_level: level,
      log_message: message,
      log_details: details || {}
    });

    if (error) {
      console.error('[LogService] Erro ao criar log via RPC:', error);
      
      // Fallback: tentar inserção direta
      const { data: directData, error: directError } = await supabase
        .from('logs')
        .insert([{
          level,
          message,
          details,
          user_id
        }])
        .select()
        .single();

      if (directError) {
        console.error('[LogService] Erro na inserção direta:', directError);
        return formatCrudResult(null, directError);
      }
      
      console.log('[LogService] Log criado via inserção direta:', directData?.id);
      return formatCrudResult(directData as LogEntry, null);
    }
    
    // Se RPC funcionou, buscar o log criado
    const { data: createdLog, error: fetchError } = await supabase
      .from('logs')
      .select('*')
      .eq('id', data)
      .single();
    
    if (fetchError) {
      console.error('[LogService] Erro ao buscar log criado:', fetchError);
      // Retornar sucesso mesmo sem os dados completos
      return formatCrudResult({ id: data } as LogEntry, null);
    }
    
    console.log('[LogService] Log criado com sucesso via RPC:', data);
    return formatCrudResult(createdLog as LogEntry, null);
  } catch (error) {
    console.error('[LogService] Erro inesperado ao criar log:', error);
    return formatCrudResult(null, error instanceof Error ? error : new Error(String(error)));
  }
};

export const getLatestLogs = async (limit: number = 10): Promise<CrudResult<LogEntry[]>> => {
  try {
    console.log(`[LogService] Buscando ${limit} logs mais recentes`);
    
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[LogService] Erro ao buscar logs:', error);
      return formatCrudResult(null, error);
    }
    
    console.log(`[LogService] ${data?.length || 0} logs obtidos com sucesso`);
    return formatCrudResult(data as LogEntry[], null);
  } catch (error) {
    console.error('[LogService] Erro inesperado ao buscar logs:', error);
    return formatCrudResult(null, error instanceof Error ? error : new Error(String(error)));
  }
};

export const getAuthSyncLogs = async (limit: number = 10): Promise<CrudResult<LogEntry[]>> => {
  try {
    console.log(`[LogService] Buscando ${limit} logs de sincronização`);
    
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .or('message.ilike.%sync%,message.ilike.%auth%,message.ilike.%manager%')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[LogService] Erro ao buscar logs de sincronização:', error);
      return formatCrudResult(null, error);
    }
    
    console.log(`[LogService] ${data?.length || 0} logs de sincronização obtidos com sucesso`);
    return formatCrudResult(data as LogEntry[], null);
  } catch (error) {
    console.error('[LogService] Erro inesperado ao buscar logs de sincronização:', error);
    return formatCrudResult(null, error instanceof Error ? error : new Error(String(error)));
  }
};

export const testLogCreation = async (): Promise<CrudResult<LogEntry>> => {
  console.log('[LogService] Criando log de teste');
  return createLog('info', 'Teste de criação de log', { 
    test: true,
    timestamp: new Date().toISOString() 
  });
};
