import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
const supabaseClient = createClient(supabaseUrl, supabaseAnon);

async function run() {
    console.log("Admin Query:");
    const { data: adminData, error: adminError } = await supabaseAdmin.from('companies').select('*');
    console.log(adminData, adminError);

    console.log("Anon Query:");
    const { data: anonData, error: anonError } = await supabaseClient.from('companies').select('*');
    console.log(anonData, anonError);
}
run();
