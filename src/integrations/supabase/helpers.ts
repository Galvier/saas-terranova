
// Helper functions for Supabase client
import { supabase } from "./client";

// Safe accessor for Supabase URL (since supabaseUrl is protected)
export const getSupabaseUrl = (): string => {
  // Hardcoded URL as a fallback - this matches the one in client.ts
  return "https://zghthguqsravpcvrgahe.supabase.co";
};
