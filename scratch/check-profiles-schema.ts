import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking profiles table columns...");
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
    
    if (error) {
        // Alternative: try to select from information_schema via a trick if possible, 
        // but usually we can just guess or try to insert and read the error if RPC fails.
        console.log("RPC failed, trying a direct query to information_schema if allowed...");
        const { data: cols, error: err2 } = await supabase.from('profiles').select().limit(0);
        console.log("Columns from select:", cols);
        console.log("Error:", err2);
    } else {
        console.log("Columns:", data);
    }
}
run();
