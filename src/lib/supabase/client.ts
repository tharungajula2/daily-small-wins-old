import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// We will add proper database types later, keeping it dynamic for now
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
