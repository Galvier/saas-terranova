
import { supabase } from './client';
import { Database } from './types';

export type CrudResult<T = any> = {
  error: Error | null;
  data: T | null;
  message?: string;
  status?: 'success' | 'error';
};

export const formatCrudResult = <T>(
  data: T | null,
  error: Error | null
): CrudResult<T> => {
  return {
    data,
    error,
    status: error ? 'error' : 'success',
    message: error ? error.message : 'Operation successful'
  };
};

// Generic RPC call function to standardize all database function calls
export const callRPC = async <T>(
  functionName: string,
  params: Record<string, any> = {}
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    return { data, error };
  } catch (error: any) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// Check if a table exists
export const checkTableExists = async (
  tableName: string
): Promise<CrudResult<boolean>> => {
  try {
    const { data, error } = await callRPC<boolean>('check_table_exists', {
      table_name: tableName,
    });

    if (error) return formatCrudResult(null, error);
    return formatCrudResult(data, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Check if a table exists and count rows
export const checkTableExistsAndCount = async (
  tableName: string
): Promise<CrudResult<{ exists: boolean; count: number }>> => {
  try {
    const { data, error } = await callRPC<{ exists: boolean; count: number }>('check_table_exists_and_count', {
      table_name: tableName,
    });

    if (error) return formatCrudResult(null, error);
    return formatCrudResult(data, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Create a diagnostic table for testing
export const createDiagnosticTable = async (): Promise<
  CrudResult<{ success: boolean }>
> => {
  try {
    const { data, error } = await callRPC<{ success: boolean }>('create_diagnostic_table_if_not_exists');

    if (error) return formatCrudResult(null, error);
    return formatCrudResult({ success: true }, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Run a diagnostic write test
export const runDiagnosticWriteTest = async (): Promise<
  CrudResult<{ success: boolean }>
> => {
  try {
    const { data, error } = await callRPC<{ success: boolean }>('run_diagnostic_write_test');

    if (error) return formatCrudResult(null, error);
    return formatCrudResult({ success: true }, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Get PostgreSQL version
export const getPostgresVersion = async (): Promise<
  CrudResult<{ version: string }>
> => {
  try {
    const { data, error } = await callRPC<string>('postgres_version');

    if (error) return formatCrudResult(null, error);
    return formatCrudResult({ version: data as string }, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Check a user profile
export const checkUserProfile = async (
  userId: string
): Promise<CrudResult<{ exists: boolean }>> => {
  try {
    const { data, error } = await callRPC<{ exists: boolean }>('check_user_profile', {
      user_id: userId,
    });

    if (error) return formatCrudResult(null, error);
    return formatCrudResult(data, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Export the Supabase URL for utility functions
export const getSupabaseUrl = (): string => {
  return supabase.auth.getSession().then(() => supabase.supabaseUrl) as unknown as string;
};

export { supabase };
