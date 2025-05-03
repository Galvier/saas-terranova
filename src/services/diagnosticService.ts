
import { supabase } from '@/integrations/supabase/client';
import { createGenericServiceResult } from '@/integrations/supabase';

export async function runAllDiagnosticTests() {
  try {
    const results = [];
    
    // Test database connectivity
    const dbResult = await testDatabaseConnection();
    results.push({
      test: "database_connection",
      passed: dbResult.error ? false : true,
      message: dbResult.error ? dbResult.message : "Database connection successful",
      details: dbResult.data
    });
    
    // Test table creation
    const tableResult = await testTableCreation();
    results.push({
      test: "table_creation",
      passed: tableResult.error ? false : true,
      message: tableResult.error ? tableResult.message : "Table creation successful",
      details: tableResult.data
    });
    
    // Test writing to database
    const writeResult = await testDatabaseWrite();
    results.push({
      test: "database_write",
      passed: writeResult.error ? false : true,
      message: writeResult.error ? writeResult.message : "Database write successful",
      details: writeResult.data
    });
    
    // Test user profile check
    const userResult = await testUserProfileCheck();
    results.push({
      test: "user_profile_check",
      passed: userResult.error ? false : true,
      message: userResult.error ? userResult.message : "User profile check successful",
      details: userResult.data
    });
    
    return createGenericServiceResult(results);
  } catch (error) {
    console.error("Error running diagnostic tests:", error);
    return createGenericServiceResult(null, error, "Error running diagnostic tests");
  }
}

export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.rpc('postgres_version');
    
    if (error) {
      console.error("Database connection error:", error);
      return createGenericServiceResult(null, error, "Failed to connect to database");
    }
    
    return createGenericServiceResult(data);
  } catch (error) {
    console.error("Exception testing database connection:", error);
    return createGenericServiceResult(null, error, "Exception testing database connection");
  }
}

export async function testTableCreation() {
  try {
    const { data, error } = await supabase.rpc('create_diagnostic_table_if_not_exists');
    
    if (error) {
      console.error("Table creation error:", error);
      return createGenericServiceResult(null, error, "Failed to create diagnostic table");
    }
    
    return createGenericServiceResult(data);
  } catch (error) {
    console.error("Exception testing table creation:", error);
    return createGenericServiceResult(null, error, "Exception testing table creation");
  }
}

export async function testDatabaseWrite() {
  try {
    const testId = crypto.randomUUID();
    const { data, error } = await supabase.rpc('run_diagnostic_write_test', { 
      test_id_param: testId 
    });
    
    if (error) {
      console.error("Database write error:", error);
      return createGenericServiceResult(null, error, "Failed to write to database");
    }
    
    return createGenericServiceResult(data);
  } catch (error) {
    console.error("Exception testing database write:", error);
    return createGenericServiceResult(null, error, "Exception testing database write");
  }
}

export async function testUserProfileCheck() {
  try {
    // Fixed: Using a different parameter name
    const { data, error } = await supabase.rpc('check_user_profile', { 
      email: 'test@example.com' 
    });
    
    if (error) {
      console.error("User profile check error:", error);
      return createGenericServiceResult(null, error, "Failed to check user profile");
    }
    
    return createGenericServiceResult(data);
  } catch (error) {
    console.error("Exception testing user profile check:", error);
    return createGenericServiceResult(null, error, "Exception testing user profile check");
  }
}
