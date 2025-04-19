
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase Configuration
const SUPABASE_URL = "https://zghthguqsravpcvrgahe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaHRoZ3Vxc3JhdnBjdnJnYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzkxNTQsImV4cCI6MjA2MDQxNTE1NH0.1NaMBtnpxGksfayFK3Pul6_UUcDAFalSUdXWgppkUbw";

// Create a single Supabase client instance with explicit configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'business-manager-auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    fetch: fetch,
    headers: { 'x-app-version': '1.0.0' }
  }
});

// Define valid table names to use with type safety
export const Tables = {
  PROFILES: 'profiles',
  DEPARTMENTS: 'departments',
  MANAGERS: 'managers',
  DIAGNOSTIC_TESTS: 'diagnostic_tests'
} as const;

// Type for storing the table names
export type ValidTableName = typeof Tables[keyof typeof Tables];

// Type definitions for RPC function returns
export interface TableCheckResult {
  exists: boolean;
  count: number;
}

// Basic connection test function that doesn't rely on postgres_version()
export const testSupabaseConnection = async (): Promise<{success: boolean; message: string; responseTime?: number}> => {
  try {
    console.log('Testing Supabase connection...');
    const startTime = performance.now();
    
    // Use the pg_client_encoding RPC function for testing connection
    const { data, error } = await supabase.rpc('pg_client_encoding');
    
    const responseTime = Math.round(performance.now() - startTime);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        message: `Connection error: ${error.message}`,
      };
    }
    
    console.log(`Supabase connection successful (${responseTime}ms)`);
    return {
      success: true,
      message: `Connected successfully in ${responseTime}ms`,
      responseTime
    };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error',
    };
  }
};

// Test database tables with a more cautious approach
export const checkDatabaseTables = async (): Promise<{[tableName: string]: {exists: boolean; count?: number; error?: string}}> => {
  const tablesToCheck = Object.values(Tables);
  const results: {[tableName: string]: {exists: boolean; count?: number; error?: string}} = {};
  
  for (const tableName of tablesToCheck) {
    try {
      console.log(`Checking table: ${tableName}`);
      
      // First check if the table exists without trying to query it directly
      // This is done to avoid policy recursion issues
      const { data, error } = await supabase.rpc<TableCheckResult>('check_table_exists', {
        table_name: tableName
      });
      
      if (error || !data) {
        console.error(`Error checking if table ${tableName} exists:`, error || 'No data returned');
        results[tableName] = { 
          exists: false, 
          error: error ? error.message : 'Failed to verify table existence' 
        };
        continue;
      }
      
      // If the table doesn't exist, no need to try counting
      if (!data.exists) {
        results[tableName] = { exists: false };
        continue;
      }
      
      // If we got here, the table exists - try to get an approximate count safely
      results[tableName] = { 
        exists: true, 
        count: data.count || 0
      };
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error);
      results[tableName] = { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  console.log('Database tables check results:', results);
  return results;
};

// Log client initialization
console.log("Supabase client initialized with updated configuration");
