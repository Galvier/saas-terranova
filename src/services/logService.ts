
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
    
    const logData = {
      level,
      message,
      details,
      user_id
    };
    
    const { data, error } = await supabase
      .from('logs')
      .insert([logData])
      .select()
      .single();

    if (error) {
      console.error('[LogService] Erro ao criar log:', error);
      return formatCrudResult(null, error);
    }
    
    console.log('[LogService] Log criado com sucesso:', data?.id);
    return formatCrudResult(data as LogEntry, null);
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
      .or('message.ilike.%sync%,message.ilike.%auth%')
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
