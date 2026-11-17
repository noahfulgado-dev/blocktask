export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True once real project credentials are present. Lets the UI keep working
 * (and show setup instructions) before the Supabase project is connected.
 */
export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.length > 0 &&
    SUPABASE_ANON_KEY.length > 0 &&
    !SUPABASE_URL.includes("placeholder") &&
    !SUPABASE_ANON_KEY.includes("placeholder")
  );
}
