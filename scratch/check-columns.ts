import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking table structures...");
    
    console.log("\nCompanies:");
    const { data: co } = await supabase.from('companies').select('*').limit(1);
    console.log(co ? Object.keys(co[0] || {}) : "No data");

    console.log("\nProfiles:");
    const { data: pr } = await supabase.from('profiles').select('*').limit(1);
    console.log(pr ? Object.keys(pr[0] || {}) : "No data");

    console.log("\nServices:");
    const { data: sv } = await supabase.from('services').select('*').limit(1);
    console.log(sv ? Object.keys(sv[0] || {}) : "No data");
}
run();
