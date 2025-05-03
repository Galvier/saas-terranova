
import { supabase } from "./client";

type Tables = {
  users: {
    Row: any;
    Insert: any;
    Update: any;
  };
};

// Define your RPC function parameter types here
export type RpcParams = {
  check_table_exists: {
    table_name: string;
  };
  check_table_exists_and_count: {
    table_name: string;
  };
  check_user_profile: { 
    email: string;
  };
  get_user_profile_by_id: {
    user_id_param: string;
  };
  postgres_version: never;
  create_diagnostic_table: {
    table_name?: string;
  };
  create_diagnostic_table_if_not_exists: never;
  run_diagnostic_write_test: {
    test_id_param: string;
  };
  create_department: {
    department_name: string;
    department_description: string;
    department_is_active: boolean;
    department_manager_id?: string | null;
  };
  update_department: {
    id: string;
    name: string;
    description?: string | null;
    manager_id?: string | null;
    is_active?: boolean;
  };
  get_all_departments: never;
  create_manager: {
    manager_name: string;
    manager_email: string;
    manager_department_id?: string | null;
    manager_is_active: boolean;
    manager_password?: string;
    manager_role?: string;
  };
  update_manager: {
    manager_id: string;
    manager_name: string;
    manager_email: string;
    manager_department_id?: string | null;
    manager_is_active: boolean;
    manager_role?: string;
  };
  delete_manager: {
    manager_id: string;
  };
  get_manager_by_id: {
    manager_id: string;
  };
  get_all_managers: never;
  get_metrics_by_department: {
    department_id_param?: string;
    date_param?: string;
  };
  get_metrics_by_department_and_date: {
    department_id?: string;
    date_str: string;
  };
  // Metric definitions
  get_metric_definitions: {
    department_id?: string;
  };
  create_metric_definition: {
    metric_name: string;
    metric_description: string;
    metric_department_id: string;
    metric_unit: string;
    metric_target: number;
    metric_frequency?: string;
    metric_is_active?: boolean;
    metric_icon_name?: string;
    metric_lower_is_better?: boolean;
    metric_visualization_type?: string;
    metric_priority?: string;
    metric_default_period?: string;
  };
  update_metric_definition: {
    metric_id: string;
    metric_name: string;
    metric_description: string;
    metric_department_id: string;
    metric_unit: string;
    metric_target: number;
    metric_frequency?: string;
    metric_is_active?: boolean;
    metric_icon_name?: string;
    metric_lower_is_better?: boolean;
    metric_visualization_type?: string;
    metric_priority?: string;
    metric_default_period?: string;
  };
  delete_metric_definition: {
    metric_id: string;
  };
  record_metric_value: {
    metric_id: string;
    metric_value: number;
    metric_date?: string;
  };
  save_admin_dashboard_config: {
    metrics_ids: string[];
    user_id: string;
  };
  get_admin_dashboard_config: {
    user_id_param: string;
  };
  get_metric_history: {
    metric_id_param: string;
    limit_param?: number;
  };
  validate_metric_value_date: {
    metric_id: string;
    value_date: string;
  };
};

// Reusable result types for better error handling
export type CrudResult<T> = {
  data: T | null;
  error: boolean;
  message: string;
};

// Export the formatCrudResult function to standardize API responses
export function formatCrudResult<T>(data: T | null, error: any = null): CrudResult<T> {
  if (error) {
    console.error("Service error:", error);
    return {
      data: null,
      error: true,
      message: error.message || "An error occurred",
    };
  }

  return {
    data,
    error: false,
    message: "",
  };
}

// Function to call Supabase RPC functions - create an alias for backwards compatibility
export async function callRPC<T>(
  functionName: keyof RpcParams, 
  params: any
): Promise<{data: T | null; error: any}> {
  return callRpcFunction(functionName, params);
}

export function createGenericServiceResult<T>(
  data: T | null,
  error: any = null,
  message: string = ""
) {
  if (error) {
    console.error("Service error:", error);
    return {
      data: null as T | null,
      error: true,
      message: message || error.message || "An error occurred",
    };
  }

  return {
    data,
    error: false,
    message,
  };
}

export async function getTableCount(tableName: string) {
  const { data, error } = await supabase.rpc(
    "check_table_exists_and_count",
    {
      table_name: tableName,
    });

  if (error) {
    console.error("Error checking table:", error);
    return createGenericServiceResult(null, error);
  }

  return createGenericServiceResult(data);
}

export async function callRpcFunction<K extends keyof RpcParams>(
  functionName: K,
  params?: RpcParams[K]
) {
  try {
    const { data, error } = await supabase.rpc(
      functionName as string,
      params as any
    );

    if (error) {
      console.error(`Error calling RPC ${functionName}:`, error);
      return createGenericServiceResult(null, error);
    }

    return createGenericServiceResult(data);
  } catch (error) {
    console.error(`Exception calling RPC ${functionName}:`, error);
    return createGenericServiceResult(null, error);
  }
}

export async function checkUserProfileByEmail(email: string) {
  try {
    // Fixed: Use a different parameter name to avoid confusion with the column
    const { data, error } = await callRpcFunction<"check_user_profile">(
      "check_user_profile", 
      { email } as RpcParams["check_user_profile"]
    );

    if (error) {
      console.error("Error checking user profile:", error);
      return createGenericServiceResult(null, error);
    }

    return createGenericServiceResult(data);
  } catch (error) {
    console.error("Exception checking user profile:", error);
    return createGenericServiceResult(null, error);
  }
}

// Add the getSupabaseUrl function
export function getSupabaseUrl(): string {
  // Get the URL from the supabase client configuration
  const url = 'https://wjuzzjitpkhjjxujxftm.supabase.co';
  return url;
}

// Type-safe version for table operations
export type KnownTable = "managers" | "departments" | "metrics_definition" | 
                 "admin_dashboard_config" | "diagnostic_tests" | "logs" | 
                 "metrics" | "metrics_values" | "profiles" | "settings" | "users";

export async function getTableData<T = any>(
  tableName: KnownTable,
  columns: string = "*",
  options?: {
    filters?: { column: string; value: any; operator?: string }[];
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
    count?: "exact" | "planned" | "estimated";
  }
) {
  try {
    let query = supabase.from(tableName).select(columns);

    // Apply filters if provided
    if (options?.filters && options.filters.length > 0) {
      for (const filter of options.filters) {
        const { column, value, operator = "eq" } = filter;
        query = query.filter(column, operator, value);
      }
    }

    // Apply ordering if provided
    if (options?.orderBy) {
      const { column, ascending = true } = options.orderBy;
      query = query.order(column, { ascending });
    }

    // Apply pagination if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      return createGenericServiceResult(null, error);
    }

    return createGenericServiceResult(
      {
        records: data,
        count,
      } as { records: T[]; count: number | null }
    );
  } catch (error) {
    console.error(`Exception fetching data from ${tableName}:`, error);
    return createGenericServiceResult(null, error);
  }
}

export async function getRecordById<T = any>(
  tableName: KnownTable,
  id: string,
  columns: string = "*"
) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching record with id ${id} from ${tableName}:`, error);
      return createGenericServiceResult(null, error);
    }

    return createGenericServiceResult(data as T);
  } catch (error) {
    console.error(
      `Exception fetching record with id ${id} from ${tableName}:`,
      error
    );
    return createGenericServiceResult(null, error);
  }
}

export async function insertRecord<T = any>(
  tableName: KnownTable,
  record: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(record as any)
      .select();

    if (error) {
      console.error(`Error inserting record into ${tableName}:`, error);
      return createGenericServiceResult(null, error);
    }

    return createGenericServiceResult(data?.[0] as T);
  } catch (error) {
    console.error(`Exception inserting record into ${tableName}:`, error);
    return createGenericServiceResult(null, error);
  }
}

export async function updateRecord<T = any>(
  tableName: KnownTable,
  id: string,
  record: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(record as any)
      .eq("id", id)
      .select();

    if (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      return createGenericServiceResult(null, error);
    }

    return createGenericServiceResult(data?.[0] as T);
  } catch (error) {
    console.error(`Exception updating record in ${tableName}:`, error);
    return createGenericServiceResult(null, error);
  }
}

export async function deleteRecord(tableName: KnownTable, id: string) {
  try {
    const { error } = await supabase.from(tableName).delete().eq("id", id);

    if (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      return createGenericServiceResult(null, error);
    }

    return createGenericServiceResult(true);
  } catch (error) {
    console.error(`Exception deleting record from ${tableName}:`, error);
    return createGenericServiceResult(null, error);
  }
}
