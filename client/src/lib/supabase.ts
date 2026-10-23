import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the frontend environment.",
    );
  }

  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
  supabase = createClient(url, anonKey);
  supabase.auth.onAuthStateChange((_event, session) => {
    if (typeof window === "undefined") return;
    if (session) {
      localStorage.setItem("access_token", session.access_token);
    } else {
      localStorage.removeItem("access_token");
    }
  });
  return supabase;
}
