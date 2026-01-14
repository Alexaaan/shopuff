let supabase: any = null;

export async function getSupabase() {
  if (!supabase) {
    const { createClient } = await import('@supabase/supabase-js');
    const isServer = typeof window === 'undefined';
    const supabaseUrl = isServer ? process.env.SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = isServer ? process.env.SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}