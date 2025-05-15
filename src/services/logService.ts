
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
    const { data, error } = await supabase
      .from('logs')
      .insert([
        {
          level,
          message,
          details,
          user_id
        }
      ])
      .select()
      .single();

    return formatCrudResult(data as LogEntry, error);
  } catch (error) {
    console.error('Error creating log:', error);
    return formatCrudResult(null, error);
  }
};

export const getLatestLogs = async (limit: number = 10): Promise<CrudResult<LogEntry[]>> => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return formatCrudResult(data as LogEntry[], error);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return formatCrudResult(null, error);
  }
};

export const getAuthSyncLogs = async (limit: number = 10): Promise<CrudResult<LogEntry[]>> => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .ilike('message', '%sync%')
      .order('created_at', { ascending: false })
      .limit(limit);

    return formatCrudResult(data as LogEntry[], error);
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return formatCrudResult(null, error);
  }
};

export const testLogCreation = async (): Promise<CrudResult<LogEntry>> => {
  return await createLog('info', 'Teste de criação de log', { test: true });
};
