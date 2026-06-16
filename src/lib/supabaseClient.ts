import { createClient } from "@supabase/supabase-js";

// Browser Supabase client (publishable/anon key only — safe to expose).
// Used for ADMIN AUTHENTICATION via Supabase Auth (email/password). It never
// touches lead/submission data — that all goes through the serverless /api.
const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "ai_scorecard_admin_auth",
  },
});

// Returns the current admin access token (refreshing if needed), or null.
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
