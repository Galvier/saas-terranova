import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

// Initialize Supabase client
let supabase: SupabaseClient;

// Function to initialize Supabase client
export const initSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
};

// Call this function to get the Supabase client instance
export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    initSupabase();
  }
  return supabase;
};

// Function to get Supabase URL
export const getSupabaseUrl = (): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL is required');
  }
  return supabaseUrl;
};

// Function to get Supabase Key
export const getSupabaseKey = (): string => {
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    throw new Error('Supabase Key is required');
  }
  return supabaseKey;
};

// Define known table names
export type KnownTable =
  | 'departments'
  | 'managers'
  | 'metrics'
  | 'profiles';

// Type for generic CRUD result
export type CrudResult<T> = {
  data: T | null;
  error: {
    message: string;
    details: string;
    hint: string;
    code: string;
  } | null;
  message?: string;
};

// Function to format CRUD result
export function formatCrudResult<T>(data: T | null, error: PostgrestError | null = null, message?: string): CrudResult<T> {
  if (error) {
    console.error('CRUD Error:', error);
    return {
      data: null,
      error: {
        message: error.message,
        details: error.details || '',
        hint: error.hint || '',
        code: error.code || ''
      },
      message: message || error.message
    };
  }
  
  return {
    data,
    error: null,
    message: message || 'Success'
  };
}

// Function to insert a record into a table
export async function insertRecord<T>(tableName: KnownTable, record: T): Promise<CrudResult<T>> {
  try {
    const { data, error } = await getSupabase()
      .from(tableName)
      .insert([record])
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting record into ${tableName}:`, error);
      return formatCrudResult(null, error);
    }
    
    return formatCrudResult(data);
  } catch (error: any) {
    console.error(`Exception inserting record into ${tableName}:`, error);
    return formatCrudResult(null, {
      message: error.message || 'Unknown error occurred',
      details: '',
      hint: '',
      code: ''
    });
  }
}

// Function to update a record in a table
export async function updateRecord<T>(tableName: KnownTable, id: string, record: T): Promise<CrudResult<T>> {
    try {
        const { data, error } = await getSupabase()
            .from(tableName)
            .update(record)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating record in ${tableName}:`, error);
            return formatCrudResult(null, error);
        }

        return formatCrudResult(data);
    } catch (error: any) {
        console.error(`Exception updating record in ${tableName}:`, error);
        return formatCrudResult(null, {
            message: error.message || 'Unknown error occurred',
            details: '',
            hint: '',
            code: ''
        });
    }
}

// Function to delete a record from a table
export async function deleteRecord<T>(tableName: KnownTable, id: string): Promise<CrudResult<T>> {
    try {
        const { data, error } = await getSupabase()
            .from(tableName)
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error deleting record from ${tableName}:`, error);
            return formatCrudResult(null, error);
        }

        return formatCrudResult(data);
    } catch (error: any) {
        console.error(`Exception deleting record from ${tableName}:`, error);
        return formatCrudResult(null, {
            message: error.message || 'Unknown error occurred',
            details: '',
            hint: '',
            code: ''
        });
    }
}

// Define the available RPC function names as a type
// This should include all database functions that are callable
export type RpcFunctionName =
  | 'check_table_exists_and_count'
  | 'create_department'
  | 'create_diagnostic_table_if_not_exists'
  | 'create_manager'
  | 'create_metric_definition'
  | 'delete_manager'
  | 'delete_metric_definition'
  | 'get_admin_dashboard_config'
  | 'get_all_departments'
  | 'get_all_managers'
  | 'get_manager_by_id'
  | 'get_metrics_by_department'
  | 'get_metric_history'
  | 'get_user_profile_by_id'
  | 'postgres_version'
  | 'record_metric_value'
  | 'run_diagnostic_write_test'
  | 'save_admin_dashboard_config'
  | 'update_manager'
  | 'update_metric_definition'
  | 'validate_metric_value_date';

// Type for RPC parameters
export interface RpcParams {
  'check_table_exists_and_count': { table_name: string };
  'check_user_profile': { user_id: string };
  'create_department': {
    department_name: string;
    department_description: string;
    department_is_active: boolean;
    department_manager_id?: string;
  };
  'create_diagnostic_table_if_not_exists': Record<string, never>;
  'create_manager': {
    manager_name: string;
    manager_email: string;
    manager_department_id: string;
    manager_is_active: boolean;
    manager_password?: string;
    manager_role?: string;
  };
  'create_metric_definition': {
    metric_name: string;
    metric_description: string;
    metric_unit: string;
    metric_target: number;
    metric_department_id: string;
    metric_frequency?: string;
    metric_is_active?: boolean;
    metric_icon_name?: string;
    metric_lower_is_better?: boolean;
    metric_visualization_type?: string;
    metric_priority?: string;
    metric_default_period?: string;
  };
  'delete_manager': { manager_id: string };
  'delete_metric_definition': { metric_id: string };
  'get_admin_dashboard_config': { user_id_param: string };
  'get_all_departments': Record<string, never>;
  'get_all_managers': Record<string, never>;
  'get_manager_by_id': { manager_id: string };
  'get_metrics_by_department': { department_id_param?: string; date_param?: string };
  'get_metric_history': { metric_id_param: string; limit_param?: number };
  'get_user_profile_by_id': { user_id_param: string };
  'postgres_version': Record<string, never>;
  'record_metric_value': { metric_id: string; metric_value: number; metric_date?: string };
  'run_diagnostic_write_test': { test_id_param: string };
  'save_admin_dashboard_config': { metrics_ids: string[]; user_id: string };
  'update_manager': {
    manager_id: string;
    manager_name: string;
    manager_email: string;
    manager_department_id: string;
    manager_is_active: boolean;
    manager_role?: string;
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
    metric_lower_is_better?: boolean;
    metric_visualization_type?: string;
    metric_priority?: string;
    metric_default_period?: string;
  };
  'validate_metric_value_date': { metric_id: string; value_date: string };
}

// Function to call RPC function with typed parameters
export async function callRPC<T = any>(
  functionName: RpcFunctionName,
  params: any = {}
): Promise<{ data: T | null; error: PostgrestError | null }> {
  try {
    console.log(`Calling RPC: ${functionName} with params:`, params);
    
    // Validate function name exists
    if (!functionName) {
      throw new Error('Function name is required');
    }
    
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error(`Error in RPC call to ${functionName}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Exception in RPC call to ${functionName}:`, error);
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: '',
        hint: '',
        code: ''
      } 
    };
  }
}

// Export functions
export {
  getSupabase,
  formatCrudResult,
  insertRecord,
  updateRecord,
  deleteRecord,
  supabase
};
