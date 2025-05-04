import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

// Define o URL e a chave do Supabase para o projeto
const SUPABASE_URL = "https://wjuzzjitpkhjjxujxftm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdXp6aml0cGtoamp4dWp4ZnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDY0ODcsImV4cCI6MjA2MDkyMjQ4N30.AxEUABuJzJaTQ9GZryiAfOkmHRBReYw4M798E_Z43Qc";

// Inicializa o cliente Supabase
let supabaseInstance: SupabaseClient | null = null;
try {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// Export the client for use in the app
export const supabase = supabaseInstance || createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Function to get Supabase client
export const getSupabase = (): SupabaseClient => {
  return supabase;
};

// Função para obter Supabase URL
export const getSupabaseUrl = (): string => {
  return SUPABASE_URL;
};

// Função para obter Supabase Key
export const getSupabaseKey = (): string => {
  return SUPABASE_PUBLISHABLE_KEY;
};

// Define known table names
export type KnownTable =
  | 'departments'
  | 'managers'
  | 'metrics'
  | 'metrics_definition'
  | 'metrics_values'
  | 'profiles';

// Type for generic CRUD result
export type CrudResult<T> = {
  data: T | null;
  error: {
    message: string;
    details: string;
    hint: string;
    code: string;
    name?: string;
  } | null;
  message?: string;
};

// Function to format CRUD result
export function formatCrudResult<T>(data: T | null, error: PostgrestError | any = null, message?: string): CrudResult<T> {
  if (error) {
    console.error('CRUD Error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Unknown error',
        details: error.details || '',
        hint: error.hint || '',
        code: error.code || '',
        name: error.name || 'Error'
      },
      message: message || error.message || 'Error occurred'
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
    const { data, error } = await supabase
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
    return formatCrudResult(null, error);
  }
}

// Function to update a record in a table
export async function updateRecord<T>(tableName: KnownTable, id: string, record: T): Promise<CrudResult<T>> {
    try {
        const { data, error } = await supabase
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
        return formatCrudResult(null, error);
    }
}

// Function to delete a record from a table
export async function deleteRecord<T>(tableName: KnownTable, id: string): Promise<CrudResult<T>> {
    try {
        const { data, error } = await supabase
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
        return formatCrudResult(null, error);
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
    
    // Check if supabase client is initialized
    if (!supabase || !supabase.rpc) {
      console.error('Supabase client is not properly initialized');
      throw new Error('Database client is not properly initialized. Please check connection settings.');
    }
    
    // Make the RPC call with debugging info
    console.time(`RPC call: ${functionName}`);
    
    // Create a new object for parameters to ensure all keys are properly formatted
    const formattedParams = {};
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        formattedParams[key] = params[key];
      }
    }
    
    const { data, error } = await supabase.rpc(functionName, formattedParams);
    console.timeEnd(`RPC call: ${functionName}`);
    
    if (error) {
      console.error(`Error in RPC call to ${functionName}:`, error);
      console.error(`Params used:`, params);
      return { data: null, error };
    }
    
    console.log(`RPC call ${functionName} succeeded with result:`, data);
    return { data, error: null };
  } catch (error: any) {
    console.error(`Exception in RPC call to ${functionName}:`, error);
    console.error(`Params used:`, params);
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: '',
        hint: '',
        code: '',
        name: 'Error'
      } as PostgrestError
    };
  }
}
