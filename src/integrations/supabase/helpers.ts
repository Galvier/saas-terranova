
// Helper functions for Supabase client
import { supabase } from "./client";

// Safe accessor for Supabase URL (since supabaseUrl is protected)
export const getSupabaseUrl = (): string => {
  // Hardcoded URL as a fallback - this matches the one in client.ts
  return "https://zghthguqsravpcvrgahe.supabase.co";
};

// Helper function to call RPC functions with proper typing
export async function callRPC<T>(functionName: string, params?: Record<string, any>): Promise<{ data: T | null; error: any }> {
  try {
    // Use a more comprehensive type assertion to bypass TypeScript error
    // @ts-ignore - Ignore TypeScript's complaints about the function name
    const { data, error } = await supabase.rpc(functionName, params);
    return { data, error };
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    return { data: null, error };
  }
}

// Type for get_manager_by_id RPC function result
export interface Manager {
  id: string;
  name: string;
  email: string;
  department_id: string;
  is_active: boolean;
}

// Type for check_table_exists_and_count RPC function result
export interface TableCheckResult {
  exists: boolean;
  count: number;
}
