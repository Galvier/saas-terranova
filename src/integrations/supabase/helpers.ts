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

// Define the valid RPC function names as string literals
export type RpcFunctionName = 
  | 'check_table_exists_and_count'
  | 'create_department'
  | 'create_diagnostic_table_if_not_exists'
  | 'get_all_departments'
  | 'postgres_version'
  | 'run_diagnostic_write_test'
  | 'get_all_managers'
  | 'get_manager_by_id'
  | 'update_manager'
  | 'check_user_profile'
  | 'get_metrics_by_department'
  | 'create_metric_definition'
  | 'record_metric_value'
  | 'get_metric_history';

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
};

// Function to call RPC methods with proper typing
export const callRPC = async <T = any, F extends RpcFunctionName = RpcFunctionName>(
  functionName: F,
  params: RpcParams[F] = {} as any
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

// Function to get all active managers (now uses RPC)
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
      department_manager_id: department.manager_id ?? null
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

// Function to create a new manager
export const createManager = async (
  manager: { 
    name: string; 
    email: string; 
    department_id: string;
    is_active: boolean;
  }
): Promise<CrudResult<Manager>> => {
  try {
    // For now, we'll use a dummy implementation as the RPC function is not implemented yet
    // This will be replaced with an actual RPC call once the backend is ready
    console.log("Creating manager:", manager);
    
    // Create a dummy success response
    const newManager: Manager = {
      id: crypto.randomUUID(),
      name: manager.name,
      email: manager.email,
      department_id: manager.department_id,
      is_active: manager.is_active,
      created_at: new Date().toISOString()
    };

    return formatCrudResult(newManager, null);
  } catch (error) {
    console.error('Error creating manager:', error);
    return formatCrudResult(null, error);
  }
};

// Add new interfaces for metrics
export interface MetricDefinition {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  target: number;
  current: number;
  department_id: string | null;
  department_name: string | null;
  frequency: string;
  trend: 'up' | 'down' | 'neutral';
  status: 'success' | 'warning' | 'danger';
  is_active: boolean;
}

export interface MetricHistory {
  date: string;
  value: number;
}

// Add new function to get metrics by department
export const getMetricsByDepartment = async (departmentId?: string): Promise<CrudResult<MetricDefinition[]>> => {
  try {
    // If departmentId is "all", pass undefined to get all metrics
    const actualDepartmentId = departmentId === "all" ? undefined : departmentId;
    
    const { data, error } = await callRPC<MetricDefinition[]>('get_metrics_by_department', {
      department_id_param: actualDepartmentId
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return formatCrudResult(null, error);
  }
};

// Add function to create a new metric
export const createMetricDefinition = async (metric: {
  name: string;
  description: string;
  unit: string;
  target: number;
  department_id: string;
  frequency?: string;
  is_active?: boolean;
}): Promise<CrudResult<string>> => {
  try {
    const { data, error } = await callRPC<string>('create_metric_definition', {
      metric_name: metric.name,
      metric_description: metric.description,
      metric_unit: metric.unit,
      metric_target: metric.target,
      metric_department_id: metric.department_id,
      metric_frequency: metric.frequency,
      metric_is_active: metric.is_active
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error creating metric:', error);
    return formatCrudResult(null, error);
  }
};

// Add function to record a metric value
export const recordMetricValue = async (
  metricId: string,
  value: number,
  date?: string
): Promise<CrudResult<string>> => {
  try {
    const { data, error } = await callRPC<string>('record_metric_value', {
      metric_id: metricId,
      metric_value: value,
      metric_date: date
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error recording metric value:', error);
    return formatCrudResult(null, error);
  }
};

// Add function to get metric history
export const getMetricHistory = async (
  metricId: string,
  limit?: number
): Promise<CrudResult<MetricHistory[]>> => {
  try {
    const { data, error } = await callRPC<MetricHistory[]>('get_metric_history', {
      metric_id_param: metricId,
      limit_param: limit
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching metric history:', error);
    return formatCrudResult(null, error);
  }
};
