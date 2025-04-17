
// Helper functions for Supabase client
import { supabase } from "./supabaseClient";

// Safe accessor for Supabase URL (since supabaseUrl is protected)
export const getSupabaseUrl = (): string => {
  return "https://zghthguqsravpcvrgahe.supabase.co";
};

// Helper function to call RPC functions with proper typing
export async function callRPC<T>(functionName: string, params?: Record<string, any>): Promise<{ data: T | null; error: any }> {
  try {
    // Use @ts-ignore to bypass TypeScript's error on this line
    // @ts-ignore
    const { data, error } = await supabase.rpc(functionName, params);
    return { data, error };
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    return { data: null, error };
  }
}

// Type for get_manager_by_id RPC function result
export interface Manager {
  id: string;
  name: string;
  email: string;
  department_id: string;
  is_active: boolean;
}

// Type for check_table_exists_and_count RPC function result
export interface TableCheckResult {
  exists: boolean;
  count: number;
}

// Interface para resultados de operações CRUD
export interface CrudResult<T> {
  data: T | null;
  error: any;
  status: 'success' | 'error';
  message: string;
}

// Função para padronizar resultados de operações
export function formatCrudResult<T>(data: T | null, error: any): CrudResult<T> {
  if (error) {
    return {
      data: null,
      error,
      status: 'error',
      message: error.message || 'Ocorreu um erro na operação'
    };
  }
  
  return {
    data,
    error: null,
    status: 'success',
    message: 'Operação realizada com sucesso'
  };
}
