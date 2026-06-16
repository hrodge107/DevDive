import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's see if we can query pg_policies or list tables
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .limit(1);
  console.log('units sample:', { data, error });

  // Let's see if we can run an RPC or inspect schema
  // There is a system RPC in Supabase sometimes?
}
run();
