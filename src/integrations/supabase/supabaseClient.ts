
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase Configuration
const SUPABASE_URL = "https://zghthguqsravpcvrgahe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaHRoZ3Vxc3JhdnBjdnJnYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzkxNTQsImV4cCI6MjA2MDQxNTE1NH0.1NaMBtnpxGksfayFK3Pul6_UUcDAFalSUdXWgppkUbw";

// Create a single Supabase client instance
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'business-manager-auth',
  }
});

// Basic connection test function
export const testSupabaseConnection = async (): Promise<{success: boolean; message: string; responseTime?: number}> => {
  try {
    console.log('Testing Supabase connection...');
    const startTime = performance.now();
    
    // Try a simple query to test connection
    // Use @ts-ignore to bypass TypeScript's error on this line
    // @ts-ignore
    const { data, error } = await supabase.rpc('postgres_version');
    
    const responseTime = Math.round(performance.now() - startTime);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        message: `Connection error: ${error.message}`,
      };
    }
    
    console.log(`Supabase connection successful (${responseTime}ms). PostgreSQL version:`, data);
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

// Test database tables
export const checkDatabaseTables = async (): Promise<{[tableName: string]: {exists: boolean; count?: number; error?: string}}> => {
  const tablesToCheck = ['profiles', 'departments', 'managers'];
  const results: {[tableName: string]: {exists: boolean; count?: number; error?: string}} = {};
  
  for (const tableName of tablesToCheck) {
    try {
      console.log(`Checking table: ${tableName}`);
      
      // Define the expected return type to fix the TypeScript errors
      interface TableCheckResult {
        exists: boolean;
        count?: number;
      }
      
      // Use @ts-ignore to bypass TypeScript's error
      // @ts-ignore
      const { data, error } = await supabase.rpc<TableCheckResult>('check_table_exists_and_count', {
        table_name: tableName
      });
      
      if (error) {
        console.error(`Error checking table ${tableName}:`, error);
        results[tableName] = { exists: false, error: error.message };
        continue;
      }
      
      if (!data) {
        results[tableName] = { exists: false };
        continue;
      }
      
      // Type assertion to help TypeScript understand the structure
      const checkResult = data as unknown as TableCheckResult;
      
      results[tableName] = { 
        exists: checkResult.exists, 
        count: checkResult.count 
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
console.log("Supabase client initialized");
