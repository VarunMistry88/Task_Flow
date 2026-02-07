
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client for offline mode
const createMockClient = () => ({
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Offline mode') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: () => Promise.resolve({ error: new Error('Offline mode') }),
        signInWithPassword: () => Promise.resolve({ error: new Error('Offline mode') }),
        signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
        select: () => Promise.resolve({ data: [], error: new Error('Offline mode') }),
        insert: () => Promise.resolve({ data: null, error: new Error('Offline mode') }),
        update: () => Promise.resolve({ data: null, error: new Error('Offline mode') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Offline mode') })
    })
});

export const supabase = (!supabaseUrl || !supabaseAnonKey) 
    ? createMockClient() as any
    : createClient(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Running in offline mode.');
}
