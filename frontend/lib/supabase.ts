import { createClient } from '@supabase/supabase-js';

const isServer = typeof window === 'undefined';
const supabaseUrl = isServer
    ? (process.env.INTERNAL_SUPABASE_URL || 'http://localhost:8000')
    : (process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000');

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key-for-build';

if (!supabaseAnonKey) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
