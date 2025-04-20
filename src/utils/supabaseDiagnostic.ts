
import { supabase, testSupabaseConnection, checkDatabaseTables } from '@/integrations/supabase/client';
import { CrudResult, formatCrudResult } from '@/integrations/supabase/helpers';

export interface DiagnosticTest {
  id: string;
  test_id: string;
  test_type?: string;
  created_at?: string;
  created_by?: string;
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
    const { error: rpcError } = await supabase.rpc('create_diagnostic_table_if_not_exists');
    
    if (rpcError) {
      console.error('Error creating diagnostic table:', rpcError);
      return formatCrudResult(null, rpcError);
    }
    
    // Generate a test ID
    const testId = `test_${Date.now()}`;
    
    // Try to insert a record using a function to avoid RLS issues
    const { data, error } = await supabase.rpc('run_diagnostic_write_test', { 
      test_id_param: testId 
    } as any);
    
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

// Run all diagnostic tests
export const runAllDiagnostics = async (): Promise<DiagnosticResults> => {
  const connectionTest = await testConnection();
  const tablesCheck = await testTables();
  
  let writeTest = {
    success: false,
    message: 'Write test skipped due to connection failure'
  };
  
  if (connectionTest.success) {
    const writeTestResult = await testDatabaseWrite();
    writeTest = {
      success: writeTestResult.status === 'success',
      message: writeTestResult.message,
      timeTaken: writeTestResult.data ? 
        parseInt(writeTestResult.data.created_at || '0') : undefined,
      testId: writeTestResult.data?.test_id
    };
  }
  
  return {
    connectionTest,
    tablesCheck,
    writeTest
  };
};
