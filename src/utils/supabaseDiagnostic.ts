
import { supabase } from "@/integrations/supabase/client";
import { getSupabaseUrl } from "@/integrations/supabase/helpers";
import { Tables, ValidTableName, TableCheckResult } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  status: "success" | "error";
  message: string;
  details?: any;
  timestamp: Date;
}

export interface TableInfo {
  name: string;
  recordCount: number | null;
  status: "ok" | "error" | "empty";
  message?: string;
}

export interface ConnectionInfo {
  url: string;
  responseTime: number;
  connected: boolean;
  timestamp: Date;
}

// Test basic connection to Supabase
export async function testConnection(): Promise<ConnectionInfo> {
  const startTime = performance.now();
  let connected = false;

  try {
    // Use a simple system function that doesn't require table access
    const { error } = await supabase.rpc('pg_client_encoding');
    
    if (error) throw error;
    
    connected = true;
    return {
      url: getSupabaseUrl(),
      responseTime: Math.round(performance.now() - startTime),
      connected,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      url: getSupabaseUrl(),
      responseTime: Math.round(performance.now() - startTime),
      connected: false,
      timestamp: new Date()
    };
  }
}

// Check if a table exists
export async function checkTable(tableName: string): Promise<TableInfo> {
  try {
    // Validate against allowed table names
    const validTableNames = Object.values(Tables);
    if (!validTableNames.includes(tableName as ValidTableName)) {
      return {
        name: tableName,
        recordCount: null,
        status: "error",
        message: "Invalid table name"
      };
    }

    // Use a safer approach to check if the table exists
    const { data, error } = await supabase.rpc<TableCheckResult>('check_table_exists', {
      table_name: tableName
    });

    if (error || !data) {
      return {
        name: tableName,
        recordCount: null,
        status: "error",
        message: error ? error.message : "Failed to verify table existence"
      };
    }

    if (!data.exists) {
      return {
        name: tableName,
        recordCount: null,
        status: "error",
        message: "Table does not exist"
      };
    }

    return {
      name: tableName,
      recordCount: data.count || 0,
      status: data.count === 0 ? "empty" : "ok"
    };
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return {
      name: tableName,
      recordCount: null,
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

// Run a basic write test on a test table
export async function testWriteOperation(): Promise<DiagnosticResult> {
  const testId = `test-${Date.now()}`;
  
  try {
    // Use an RPC call to safely test write operations
    const { error } = await supabase.rpc('run_diagnostic_write_test', {
      test_id: testId
    });
    
    if (error) throw error;

    return {
      status: "success",
      message: "Write test completed successfully",
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Write test failed:', error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      details: error,
      timestamp: new Date()
    };
  }
}

// Check all essential tables
export async function checkAllTables(tableNames: string[]): Promise<TableInfo[]> {
  const results: TableInfo[] = [];
  
  for (const tableName of tableNames) {
    const result = await checkTable(tableName);
    results.push(result);
  }
  
  return results;
}

// Get overall diagnostic summary
export async function runFullDiagnostic(tableNames: string[]): Promise<{
  connection: ConnectionInfo;
  tables: TableInfo[];
  writeTest: DiagnosticResult;
}> {
  const connection = await testConnection();
  const tables = await checkAllTables(tableNames);
  const writeTest = await testWriteOperation();
  
  return {
    connection,
    tables,
    writeTest
  };
}
