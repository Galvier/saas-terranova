
import { supabase, Tables, ValidTableName, TableCheckResult } from "@/integrations/supabase/client";

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

// Get Supabase URL (since we can't access it directly from the client)
export const getSupabaseUrl = (): string => {
  return "https://zghthguqsravpcvrgahe.supabase.co";
};

// Test basic connection to Supabase
export async function testConnection(): Promise<ConnectionInfo> {
  const startTime = performance.now();
  let connected = false;

  try {
    // Simple count query to test connection
    const { error } = await supabase.from('profiles').select('count(*)', { count: 'exact', head: true });
    
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

    // Check if table exists by trying to query it
    const { data, error, count } = await supabase
      .from(tableName as ValidTableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        name: tableName,
        recordCount: null,
        status: "error",
        message: error.message
      };
    }

    return {
      name: tableName,
      recordCount: count || 0,
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
    // Insert a test record
    const { error: insertError } = await supabase
      .from('diagnostic_tests')
      .insert({ test_id: testId, test_type: 'connection_test' });
    
    if (insertError) throw insertError;
    
    // Clean up by deleting the test record
    const { error: deleteError } = await supabase
      .from('diagnostic_tests')
      .delete()
      .eq('test_id', testId);
    
    if (deleteError) {
      console.warn('Could not clean up test record:', deleteError);
    }

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
