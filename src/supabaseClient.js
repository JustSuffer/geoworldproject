import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a dummy client if keys are missing to prevent crash
const dummyClient = {
    auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ error: { message: 'Supabase not configured' } }),
        signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: null })
            })
        }),
        upsert: async () => ({ error: null })
    })
};

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : dummyClient;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase keys are missing! Authentication and stats will not work.');
}
