
import { supabase } from '@/integrations/supabase/client';
import { testSupabaseConnection, checkDatabaseTables } from '@/integrations/supabase/client';
import { CrudResult, formatCrudResult, callRPC } from '@/integrations/supabase';
import { getSupabaseUrl } from '@/integrations/supabase';

export interface DiagnosticTest {
  id: string;
  test_id: string;
  test_type?: string;
  created_at?: string;
  created_by?: string;
}

export interface ConnectionInfo {
  connected: boolean;
  responseTime: number;
  url: string;
  timestamp: Date;
  message: string;
}

export interface TableInfo {
  name: string;
  status: 'ok' | 'empty' | 'error';
  recordCount: number | null;
  message: string | null;
}

export interface DiagnosticResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: Date;
  details?: any;
}

export interface DiagnosticResults {
  connectionTest: {
    success: boolean;
    message: string;
    responseTime?: number;
  };
  tablesCheck: {
    [tableName: string]: {
      exists: boolean;
      count?: number;
      error?: string;
    };
  };
  writeTest: {
    success: boolean;
    message: string;
    timeTaken?: number;
    testId?: string;
  };
}

// Tests the connection to Supabase
export const testConnection = async (): Promise<{success: boolean; message: string; responseTime?: number}> => {
  return await testSupabaseConnection();
};

// Tests if the tables exist and returns their row counts
export const testTables = async (): Promise<{[tableName: string]: {exists: boolean; count?: number; error?: string}}> => {
  return await checkDatabaseTables();
};

// Tests writing to the database by creating a diagnostic_test record
export const testDatabaseWrite = async (): Promise<CrudResult<DiagnosticTest>> => {
  try {
    const startTime = performance.now();
    console.log('Testing database write...');

    // First try to create the table if it doesn't exist
    const { error: rpcError } = await callRPC('create_diagnostic_table_if_not_exists', {});
    
    if (rpcError) {
      console.error('Error creating diagnostic table:', rpcError);
      return formatCrudResult(null, rpcError);
    }
    
    // Generate a test ID
    const testId = `test_${Date.now()}`;
    
    // Try to insert a record using a function to avoid RLS issues
    const { data, error } = await callRPC<{id: string}>('run_diagnostic_write_test', { 
      test_id_param: testId 
    });
    
    const timeTaken = Math.round(performance.now() - startTime);
    
    if (error) {
      console.error('Error in write test:', error);
      return formatCrudResult(null, error);
    }
    
    console.log(`Write test successful (${timeTaken}ms)`);
    return formatCrudResult({
      id: data?.id || 'unknown',
      test_id: testId,
      test_type: 'write_test',
    }, null);
    
  } catch (error) {
    console.error('Unexpected error in write test:', error);
    return formatCrudResult(null, error);
  }
};

// Run all diagnostic tests - this is the function we need to implement and export
export const runFullDiagnostic = async (tablesToCheck: string[]): Promise<{
  connection: ConnectionInfo;
  tables: TableInfo[];
  writeTest: DiagnosticResult;
}> => {
  // Initialize result objects
  const connectionResult = await testConnection();
  const connection: ConnectionInfo = {
    connected: connectionResult.success,
    responseTime: connectionResult.responseTime || 0,
    url: getSupabaseUrl(),
    timestamp: new Date(),
    message: connectionResult.message
  };
  
  const tableResults = await testTables();
  const tables: TableInfo[] = [];
  
  // Process table check results
  for (const tableName in tableResults) {
    const tableCheck = tableResults[tableName];
    tables.push({
      name: tableName,
      status: tableCheck.exists 
        ? (tableCheck.count && tableCheck.count > 0 ? 'ok' : 'empty') 
        : 'error',
      recordCount: tableCheck.exists ? (tableCheck.count || 0) : null,
      message: tableCheck.error || null
    });
  }
  
  // Add any missing tables from the provided list
  for (const tableName of tablesToCheck) {
    if (!tables.some(t => t.name === tableName)) {
      tables.push({
        name: tableName,
        status: 'error',
        recordCount: null,
        message: 'Table not found in database'
      });
    }
  }
  
  // Only perform write test if connection successful
  let writeTest: DiagnosticResult = {
    status: 'pending',
    message: 'Write test not performed due to connection issues',
    timestamp: new Date()
  };
  
  if (connection.connected) {
    const writeResult = await testDatabaseWrite();
    writeTest = {
      status: writeResult.status === 'success' ? 'success' : 'error',
      message: writeResult.message,
      timestamp: new Date(),
      details: writeResult.data
    };
  }
  
  return {
    connection,
    tables,
    writeTest
  };
};

// Helper function to get Supabase URL - renamed to avoid conflict
export const getSupabaseUrlUtil = (): string => {
  return getSupabaseUrl();
};
