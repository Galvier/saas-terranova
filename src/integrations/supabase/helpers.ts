
// Helper functions for Supabase client
import { supabase } from "./client";

// Safe accessor for Supabase URL (since supabaseUrl is protected)
export const getSupabaseUrl = (): string => {
  return "https://zghthguqsravpcvrgahe.supabase.co";
};

// Interface for CRUD operation results
export interface CrudResult<T> {
  data: T | null;
  error: any;
  status: 'success' | 'error';
  message: string;
}

// Function to standardize CRUD operation results
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

// Manager interface for typing
export interface Manager {
  id: string;
  name: string;
  email: string;
  department_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Type for RPC function check table results
export interface TableCheckResult {
  exists: boolean;
  count: number;
}

// RPC function call helper
export async function callRPC<T>(functionName: string, params?: Record<string, any>): Promise<{data: T | null; error: any}> {
  try {
    if (params) {
      return await supabase.rpc(functionName, params);
    } else {
      return await supabase.rpc(functionName);
    }
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    return { data: null, error };
  }
}
