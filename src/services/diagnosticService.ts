
import { v4 as uuidv4 } from 'uuid';
import { callRPC, formatCrudResult, type CrudResult, getSupabaseUrl } from '@/integrations/supabase/core';

// Diagnostic test result
export interface DiagnosticTest {
  id?: string;
  test_id?: string;
  success: boolean;
  message?: string;
  data?: any;
}

interface DiagnosticResult {
  general: DiagnosticTest[];
  database: DiagnosticTest[];
  storage: DiagnosticTest[];
  auth: DiagnosticTest[];
}

// Run basic diagnostic tests
export async function runDiagnosticTests(): Promise<DiagnosticResult> {
  const results: DiagnosticResult = {
    general: [],
    database: [],
    storage: [],
    auth: []
  };

  // General settings tests
  try {
    const supabaseUrl = getSupabaseUrl();
    
    results.general.push({
      success: !!supabaseUrl,
      message: supabaseUrl ? 'Supabase URL is set' : 'Supabase URL is not set',
      test_id: 'supabase_url',
    });
  } catch (error) {
    results.general.push({
      success: false,
      message: 'Failed to check Supabase URL',
      test_id: 'supabase_url',
    });
  }

  // Database connection test
  try {
    const pgVersion = await callRPC('postgres_version');
    
    results.database.push({
      success: !pgVersion.error && !!pgVersion.data,
      message: pgVersion.error 
        ? `Database connection failed: ${pgVersion.error.message}` 
        : `Database connected: ${pgVersion.data}`,
      test_id: 'db_connection',
      data: pgVersion.data
    });
  } catch (error) {
    results.database.push({
      success: false,
      message: 'Database connection test failed',
      test_id: 'db_connection',
    });
  }

  // Database read test
  try {
    const tableCheck = await callRPC('check_table_exists_and_count', { 
      table_name: 'departments' 
    });
    
    results.database.push({
      success: !tableCheck.error && !!tableCheck.data,
      message: tableCheck.error 
        ? `Database read failed: ${tableCheck.error.message}` 
        : `Database read success: Table ${tableCheck.data?.exists ? 'exists' : 'does not exist'}`,
      test_id: 'db_read',
      data: tableCheck.data
    });
  } catch (error) {
    results.database.push({
      success: false,
      message: 'Database read test failed',
      test_id: 'db_read',
    });
  }

  // Database write test
  try {
    // Generate a unique test ID
    const testId = uuidv4();
    
    const writeResult = await callRPC('run_diagnostic_write_test', {
      test_id_param: testId
    });
    
    results.database.push({
      success: !writeResult.error && !!writeResult.data,
      message: writeResult.error 
        ? `Database write failed: ${writeResult.error.message}` 
        : 'Database write successful',
      test_id: 'db_write',
      data: writeResult.data
    });
  } catch (error: any) {
    results.database.push({
      success: false,
      message: `Database write test failed: ${error?.message || 'Unknown error'}`,
      test_id: 'db_write',
    });
  }

  // Adding more tests for user profiles, but using a safe function that exists
  try {
    // Use check_table_exists_and_count for this test instead
    const profileCheck = await callRPC('check_table_exists_and_count', { 
      table_name: 'profiles' 
    });
    
    results.auth.push({
      success: !profileCheck.error,
      message: profileCheck.error 
        ? `User profile check failed: ${profileCheck.error.message}` 
        : `User profiles table ${profileCheck.data?.exists ? 'exists' : 'does not exist'}`,
      test_id: 'user_profiles',
      data: profileCheck.data
    });
  } catch (error: any) {
    results.auth.push({
      success: false,
      message: `User profile check failed: ${error?.message || 'Unknown error'}`,
      test_id: 'user_profiles',
    });
  }

  return results;
}

export function formatDiagnosticTest(test?: DiagnosticTest): CrudResult<DiagnosticTest> {
  if (!test) {
    return formatCrudResult(null, { 
      message: 'No test result', 
      code: '', 
      details: '', 
      hint: '',
      name: 'Error'  // Added name property to match PostgrestError
    } as any);
  }
  
  return formatCrudResult(
    test, 
    test.success ? null : { 
      message: test.message || 'Test failed', 
      code: '', 
      details: '', 
      hint: '',
      name: 'Error'  // Added name property to match PostgrestError
    } as any
  );
}
