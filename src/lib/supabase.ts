import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env file in project root with these values. ' +
    'Supabase features will be disabled.'
  );
  // Create a dummy proxy that won't crash but won't work either
  supabase = new Proxy({} as SupabaseClient, {
    get: () => () => ({ data: null, error: { message: 'Supabase not configured' } }),
  });
}

export { supabase };
