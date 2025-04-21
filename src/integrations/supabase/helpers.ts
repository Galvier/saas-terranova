
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

// Type for RPC function check table results
export interface TableCheckResult {
  exists: boolean;
  count: number;
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

// Department interface for typing
export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Define return types for RPC functions
export interface RPCReturns {
  postgres_version: string;
  check_table_exists_and_count: TableCheckResult;
  create_diagnostic_table_if_not_exists: null;
  run_diagnostic_write_test: { id: string };
  get_all_departments: { id: string; name: string }[];
  get_manager_by_id: Manager;
  update_manager: null;
  create_department: { id: string };
}

// Supported RPC function names and their parameter types
export interface RPCFunctions {
  postgres_version: Record<string, never>;
  check_table_exists_and_count: { table_name: string };
  create_diagnostic_table_if_not_exists: Record<string, never>;
  run_diagnostic_write_test: { test_id_param: string };
  get_all_departments: Record<string, never>;
  get_manager_by_id: { manager_id: string };
  update_manager: { 
    manager_id: string;
    manager_name: string;
    manager_email: string;
    manager_department_id: string;
    manager_is_active: boolean;
  };
  create_department: {
    department_name: string;
    department_description: string;
    department_is_active: boolean;
  };
}

// Type-safe RPC function call helper
export async function callRPC<
  FnName extends keyof RPCFunctions
>(
  functionName: FnName,
  params?: RPCFunctions[FnName]
): Promise<{data: RPCReturns[FnName] | null; error: any}> {
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

// Direct department creation function (alternative to RPC)
export async function createDepartment(department: {
  name: string;
  description?: string;
  is_active: boolean;
}): Promise<CrudResult<Department>> {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: department.name,
        description: department.description || null,
        is_active: department.is_active
      })
      .select()
      .single();
    
    return formatCrudResult<Department>(data, error);
  } catch (error) {
    console.error('Error creating department:', error);
    return formatCrudResult<Department>(null, error);
  }
}

// Get all departments function (alternative to RPC)
export async function getAllDepartments(): Promise<CrudResult<Department[]>> {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    return formatCrudResult<Department[]>(data, error);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return formatCrudResult<Department[]>(null, error);
  }
}
