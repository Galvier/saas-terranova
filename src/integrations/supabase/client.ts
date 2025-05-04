
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabase } from './core';

// Define URL e chave do Supabase para o projeto
const SUPABASE_URL = "https://wjuzzjitpkhjjxujxftm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdXp6aml0cGtoamp4dWp4ZnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDY0ODcsImV4cCI6MjA2MDkyMjQ4N30.AxEUABuJzJaTQ9GZryiAfOkmHRBReYw4M798E_Z43Qc";

// Exportamos o cliente já inicializado de core.ts
export { supabase };

// Test the connection to Supabase
export const testSupabaseConnection = async (): Promise<{success: boolean; message: string; responseTime?: number}> => {
  const startTime = performance.now();
  try {
    if (!supabase || !supabase.rpc) {
      console.error('Supabase client not properly initialized');
      throw new Error('Database client is not properly initialized');
    }
    
    // Call RPC for postgres_version, expect data to be string
    const { data, error } = await supabase.rpc('postgres_version');
    
    if (error) {
      console.error('Error in connection test:', error);
      throw error;
    }
    
    console.log('Connection test successful:', data);
    return {
      success: true,
      message: "Connection established successfully",
      responseTime: Math.round(performance.now() - startTime)
    };
  } catch (error: any) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      message: error?.message || "Unknown connection error",
      responseTime: Math.round(performance.now() - startTime)
    };
  }
};

// Check if database tables exist and get row counts
export const checkDatabaseTables = async (): Promise<{[tableName: string]: {exists: boolean; count?: number; error?: string}}> => {
  const result: {[tableName: string]: {exists: boolean; count?: number; error?: string}} = {};
  
  try {
    // Get all tables from information_schema.tables using a raw SQL query
    const { data: tables, error } = await supabase
      .from('departments') // Use a real table instead of schema query
      .select('id'); // Used only to test connectivity; we'll presume existence for now

    // If cannot query departments, it's likely DB connectivity issue
    if (error) {
      console.error('Error fetching departments:', error);
      // Provide a fallback for essential tables
      const essentialTables = [
        'users', 'profiles', 'departments', 'managers',
        'metrics', 'settings', 'logs'
      ];
      essentialTables.forEach((tbl) => {
        result[tbl] = { exists: false, error: error.message };
      });
      return result;
    }

    // Now check each essential table
    const tableList = [
      'users', 'profiles', 'departments', 'managers',
      'metrics', 'settings', 'logs'
    ];

    for (const tableName of tableList) {
      try {
        const { data, error } = await supabase.rpc('check_table_exists_and_count', {
          table_name: tableName
        });

        if (error) {
          result[tableName] = { exists: false, error: error.message };
        } else if (data) {
          // Parse data if needed (for JSON types)
          let parsed = typeof data === "string" ? JSON.parse(data) : data;
          result[tableName] = {
            exists: !!parsed.exists,
            count: parsed.count,
            error: undefined
          };
        }
      } catch (err: any) {
        result[tableName] = {
          exists: false,
          error: err?.message || "Error checking table"
        };
      }
    }
    return result;
  } catch (error: any) {
    console.error('Error checking database tables:', error);
    return { error: { exists: false, error: error?.message || "Unknown error" } };
  }
};
