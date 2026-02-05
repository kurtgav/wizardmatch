import { createClient } from '@supabase/supabase-js';
import { config } from './env.config';

const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL!;
const supabaseServiceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
