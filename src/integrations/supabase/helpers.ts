
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
