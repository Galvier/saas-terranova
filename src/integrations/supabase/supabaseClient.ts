
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

// Basic connection test function that doesn't rely on postgres_version()
export const testSupabaseConnection = async (): Promise<{success: boolean; message: string; responseTime?: number}> => {
  try {
    console.log('Testing Supabase connection...');
    const startTime = performance.now();
    
    // Alternative: Check if we can access a known table (profiles) instead of using postgres_version
    // @ts-ignore - Using a table that should exist in the schema
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    const responseTime = Math.round(performance.now() - startTime);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        message: `Connection error: ${error.message}`,
      };
    }
    
    console.log(`Supabase connection successful (${responseTime}ms)`, data);
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
      
      // Use direct query approach instead of RPC
      // @ts-ignore - We know the tableName might not be in the type definition
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(0);
      
      if (error) {
        console.error(`Error checking table ${tableName}:`, error);
        // Check if the error is related to table not existing
        const tableNotFound = error.message.includes('does not exist') || 
                             error.message.includes('relation') || 
                             error.code === '42P01';
        
        results[tableName] = { 
          exists: false, 
          error: error.message 
        };
        continue;
      }
      
      // If we got here, the table exists
      // Now let's count the records
      // @ts-ignore
      const countResult = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      results[tableName] = { 
        exists: true, 
        count: countResult.count || 0
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
