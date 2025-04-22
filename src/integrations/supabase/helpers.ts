import { supabase } from './client';
import { Database } from './types';

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

// Table check result interface
export interface TableCheckResult {
  exists: boolean;
  count?: number;
  error?: string;
}

// Define the valid RPC function names
export type RpcFunctionName = 
  | 'check_table_exists_and_count'
  | 'create_department'
  | 'create_diagnostic_table_if_not_exists'
  | 'get_all_departments'
  | 'postgres_version'
  | 'run_diagnostic_write_test'
  | 'get_manager_by_id'
  | 'update_manager'
  | 'check_user_profile'
  | 'get_all_managers';

// Define parameter types for each RPC function
export type RpcParams = {
  'check_table_exists_and_count': { table_name: string };
  'create_department': { 
    department_name: string; 
    department_description: string; 
    department_is_active: boolean 
  };
  'create_diagnostic_table_if_not_exists': Record<string, never>;
  'get_all_departments': Record<string, never>;
  'postgres_version': Record<string, never>;
  'run_diagnostic_write_test': { test_id_param: string };
  'get_manager_by_id': { manager_id: string };
  'update_manager': { 
    manager_id: string;
    manager_name: string;
    manager_email: string;
    manager_department_id: string;
    manager_is_active: boolean
  };
  'check_user_profile': { user_id: string };
  'get_all_managers': Record<string, never>;
};

// Function to call RPC methods with proper typing
export const callRPC = async <T = any, F extends RpcFunctionName = RpcFunctionName>(
  functionName: F,
  params: RpcParams[F] = {} as any
): Promise<{ data: T | null; error: any }> => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    // If the result is a JSON string, parse it
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

// Define Department type
export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  manager_id?: string;
  manager_name?: string;
}

// Define Manager type (needed for ManagersUpdate.tsx)
export interface Manager {
  id: string;
  name: string;
  email: string;
  department_id?: string;
  department_name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Function to get all departments
export const getAllDepartments = async (): Promise<CrudResult<Department[]>> => {
  try {
    const { data, error } = await callRPC<Department[]>('get_all_departments');
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return formatCrudResult(null, error);
  }
};

// Function to get all active managers
export const getAllManagers = async (): Promise<CrudResult<Manager[]>> => {
  try {
    const { data, error } = await callRPC<Manager[]>('get_all_managers');
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching managers:', error);
    return formatCrudResult(null, error);
  }
};

// Function to create a new department
export const createDepartment = async (
  department: { 
    name: string; 
    description: string; 
    is_active: boolean;
    manager_id?: string;
  }
): Promise<CrudResult<Department>> => {
  try {
    const { data, error } = await callRPC<{id: string}>('create_department', {
      department_name: department.name,
      department_description: department.description,
      department_is_active: department.is_active,
      department_manager_id: department.manager_id
    });

    if (error) throw error;

    // Return the newly created department with basic info
    const newDepartment: Department = {
      id: data?.id || '',
      name: department.name,
      description: department.description,
      is_active: department.is_active,
      manager_id: department.manager_id
    };

    return formatCrudResult(newDepartment, null);
  } catch (error) {
    console.error('Error creating department:', error);
    return formatCrudResult(null, error);
  }
};
