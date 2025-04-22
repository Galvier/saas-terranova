
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

// Table check result interface
export interface TableCheckResult {
  exists: boolean;
  count?: number;
  error?: string;
}

// Function to call RPC methods with proper typing
export const callRPC = async <T = any>(
  functionName: string,
  params: Record<string, any> = {}
): Promise<{ data: T | null; error: any }> => {
  try {
    // Bypass type system with casting since Database types don't match
    const response = await (supabase.rpc as any)(functionName, params);
    return response;
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

// Function to create a new department
export const createDepartment = async (
  department: { 
    name: string; 
    description: string; 
    is_active: boolean 
  }
): Promise<CrudResult<Department>> => {
  try {
    const { data, error } = await callRPC<{id: string}>('create_department', {
      department_name: department.name,
      department_description: department.description,
      department_is_active: department.is_active
    });

    if (error) throw error;

    // Return the newly created department with basic info
    const newDepartment: Department = {
      id: data?.id || '',
      name: department.name,
      description: department.description,
      is_active: department.is_active
    };

    return formatCrudResult(newDepartment, null);
  } catch (error) {
    console.error('Error creating department:', error);
    return formatCrudResult(null, error);
  }
};
