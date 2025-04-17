
import { supabase } from "@/integrations/supabase/client";
import { getSupabaseUrl } from "@/integrations/supabase/helpers";

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
    // Simple query to test connection rather than using postgres_version
    // @ts-ignore - profiles table should exist in most Supabase projects
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
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
    // Direct query approach to check if table exists
    // @ts-ignore - Might not be in type definition
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(0);

    if (error) {
      return {
        name: tableName,
        recordCount: null,
        status: "error",
        message: error.message
      };
    }

    // If no error, table exists. Now count records
    // @ts-ignore
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return {
        name: tableName,
        recordCount: null,
        status: "error",
        message: countError.message
      };
    }

    return {
      name: tableName,
      recordCount: count,
      status: count === 0 ? "empty" : "ok"
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
    // Attempt to write to a diagnostic_tests table (assuming it exists)
    // @ts-ignore
    const { error } = await supabase
      .from('diagnostic_tests')
      .insert({
        test_id: testId,
        test_type: 'connection_test'
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
