import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the Service Role Key.
// WARNING: This client bypasses Row Level Security (RLS) entirely.
// NEVER use this client on the frontend or in publicly exposed APIs that 
// don't have their own strict authorization logic.
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null as any; // Fallback for build-time evaluation
