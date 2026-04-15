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
  const noopResult = { data: null, error: { message: 'Supabase not configured' } };
  const handler: ProxyHandler<any> = {
    get: (_target, prop) => {
      // Return a nested proxy so chained access like supabase.auth.onAuthStateChange works
      return new Proxy(() => noopResult, {
        get: (_t, innerProp) => {
          if (innerProp === 'then') return undefined; // not a thenable
          // supabase.auth.onAuthStateChange needs to return { data: { subscription: { unsubscribe } } }
          if (prop === 'auth' && innerProp === 'onAuthStateChange') {
            return () => ({ data: { subscription: { unsubscribe: () => {} } } });
          }
          if (prop === 'auth' && innerProp === 'getSession') {
            return () => Promise.resolve({ data: { session: null } });
          }
          return new Proxy(() => noopResult, handler);
        },
        apply: () => noopResult,
      });
    },
  };
  supabase = new Proxy({} as SupabaseClient, handler);
}

export { supabase };
