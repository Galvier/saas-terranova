
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
  check_user_profile_param: { // Changed name to avoid conflict
    email: string;
  };
  postgres_version: never;
  create_diagnostic_table: {
    table_name?: string;
  };
  create_diagnostic_table_if_not_exists: {
    table_name?: string;
  };
  run_diagnostic_write_test: {
    table_name?: string;
    test_id: string;
  };
  create_department: {
    name: string;
    description?: string | null;
    manager_id?: string | null;
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
    name: string;
    email: string;
    department_id?: string | null;
    role?: string;
  };
  update_manager: {
    id: string;
    name: string;
    email: string;
    department_id?: string | null;
    role?: string;
    is_active?: boolean;
  };
  delete_manager: {
    id: string;
  };
  get_manager_by_id: {
    id: string;
  };
  get_metrics_by_department_and_date: {
    department_id?: string;
    date_str: string;
  };
  // Metric definitions
  get_metric_definitions: {
    department_id?: string;
  };
  save_metric_definition: {
    id?: string;
    name: string;
    description?: string;
    department_id?: string;
    unit: string;
    target: number;
    frequency?: string;
    lower_is_better?: boolean;
    icon_name?: string;
  };
  delete_metric_definition: {
    id: string;
  };
  save_metric_value: {
    metric_definition_id: string;
    value: number;
    date?: string;
  };
  save_admin_dashboard_config: {
    metric_ids: string[];
    user_id: string;
  };
  get_admin_dashboard_config: {
    user_id_param: string;
  };
};

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
  const { data, error } = await supabase.rpc("check_table_exists_and_count", {
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
    const { data, error } = await supabase.rpc(
      "check_user_profile", 
      { email } // Pass email directly as the parameter
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

export async function getTableData<T = any>(
  tableName: string,
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
  tableName: string,
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
  tableName: string,
  record: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(record)
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
  tableName: string,
  id: string,
  record: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(record)
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

export async function deleteRecord(tableName: string, id: string) {
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
