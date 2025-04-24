import { supabase } from './client';

// Simple type to represent CRUD operation results
export interface CrudResult<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
  error: any | null;
}

// Generic result formatter for CRUD operations
export const formatCrudResult = <T>(data: T | null, error: any): CrudResult<T> => {
  if (error) {
    return {
      status: 'error',
      message: error?.message || 'An error occurred',
      data: null,
      error
    };
  }
  
  return {
    status: 'success',
    message: 'Operation completed successfully',
    data,
    error: null
  };
};

// Define parameter types for each RPC function
export type RpcParams = {
  'check_table_exists_and_count': { table_name: string };
  'create_department': { 
    department_name: string; 
    department_description: string; 
    department_is_active: boolean; 
    department_manager_id?: string | null;
  };
  'create_diagnostic_table_if_not_exists': Record<string, never>;
  'get_all_departments': Record<string, never>;
  'postgres_version': Record<string, never>;
  'run_diagnostic_write_test': { test_id_param: string };
  'get_all_managers': Record<string, never>;
  'get_manager_by_id': { manager_id: string };
  'update_manager': { 
    manager_id: string;
    manager_name: string;
    manager_email: string;
    manager_department_id: string;
    manager_is_active: boolean 
  };
  'check_user_profile': { user_id: string };
  'get_metrics_by_department': { department_id_param?: string };
  'create_metric_definition': {
    metric_name: string;
    metric_description: string;
    metric_unit: string;
    metric_target: number;
    metric_department_id: string;
    metric_frequency?: string;
    metric_is_active?: boolean;
    metric_icon_name?: string;
  };
  'record_metric_value': {
    metric_id: string;
    metric_value: number;
    metric_date?: string;
  };
  'get_metric_history': {
    metric_id_param: string;
    limit_param?: number;
  };
  'update_metric_definition': {
    metric_id: string;
    metric_name: string;
    metric_description: string;
    metric_unit: string;
    metric_target: number;
    metric_department_id: string;
    metric_frequency?: string;
    metric_is_active?: boolean;
    metric_icon_name?: string;
  };
  'delete_metric_definition': {
    metric_id: string;
  };
  'validate_metric_value_date': { 
    metric_id: string;
    value_date: string;
  };
  'create_manager': { 
    manager_name: string; 
    manager_email: string;
    manager_department_id: string;
    manager_is_active: boolean;
    manager_password?: string;
    manager_role?: string;
  };
  'update_manager': {
    manager_id: string;
    manager_name: string;
    manager_email: string;
    manager_department_id: string;
    manager_is_active: boolean;
  };
  'delete_manager': {
    manager_id: string;
  };
  'get_manager_by_id': {
    manager_id: string;
  };
};

// Function to call RPC methods with proper typing
export const callRPC = async <T = any>(
  functionName: keyof RpcParams,
  params: any = {}
): Promise<{ data: T | null; error: any }> => {
  try {
    const { data, error } = await supabase.rpc(functionName as string, params);
    let parsedData = data;
    if (data && typeof data === "string") {
      try {
        parsedData = JSON.parse(data);
      } catch {}
    }
    return { data: parsedData as T, error };
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    return { data: null, error };
  }
};

// Utility to get the Supabase URL
export const getSupabaseUrl = (): string => {
  return "https://wjuzzjitpkhjjxujxftm.supabase.co";
};

export interface Manager {
  id: string;
  name: string;
  email: string;
  department_id?: string;
  department_name?: string;
  is_active: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}
