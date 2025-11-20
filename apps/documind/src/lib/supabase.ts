import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance (singleton pattern)
 * Uses service role key for server-side operations
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL environment variable is required");
  }

  if (!supabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
}

/**
 * Get Supabase configuration values
 */
export function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
  };
}

/**
 * Reset the Supabase client instance (useful for testing)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
