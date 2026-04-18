import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Adding INSERT policy to companies...");
    const { error } = await supabase.rpc('exec_sql', {
        sql_string: `
            create policy "Permitir insertar empresas a usuarios autenticados" 
            on public.companies for insert 
            with check (auth.role() = 'authenticated');
            
            create policy "Permitir actualizar empresas a usuarios autenticados" 
            on public.companies for update 
            using (auth.role() = 'authenticated');
        `
    });
    
    // If we don't have exec_sql, we'll suggest running it manually or we'll inject it directly if possible.
    if (error) {
        console.log("Could not use RPC. Error:", error);
    } else {
        console.log("Policies added (if RPC worked).");
    }
}

run();
