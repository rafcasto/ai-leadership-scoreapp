import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SECRET (service-role) key.
// This bypasses RLS and must never be imported into client code.
let cached: SupabaseClient | null = null;

export function admin(): SupabaseClient {
  if (cached) return cached;
  const url =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";
  if (!url || !key) {
    throw new Error(
      "Missing Supabase server credentials (SUPABASE_URL / SUPABASE_SECRET_KEY)."
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
