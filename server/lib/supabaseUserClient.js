import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

/**
 * Creates a per-request Supabase client authenticated with the user's JWT.
 * RLS policies are enforced through this client (uses anon key + user token).
 * 
 * @param {string} accessToken - The user's Supabase access token (JWT)
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createUserClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
