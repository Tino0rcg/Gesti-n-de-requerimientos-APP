import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'admin@online-system.cl';
  const password = 'Admin_Online_2024!';

  console.log(`Intentando crear el usuario administrador: ${email}...`);

  // 1. Crear el usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Administrador Global' }
  });

  let userId: string | undefined;

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('El usuario ya existe en Auth. Buscando ID en la base de datos...');
      const { data: existingProfiles } = await supabase.from('profiles').select('id').eq('email', email).single();
      userId = existingProfiles?.id;
      
      if (!userId) {
        console.log('No en perfiles. Buscando en lista de Auth Admin...');
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('Error al listar usuarios:', listError.message);
        }
        const existingAuthUser = listData?.users.find(u => u.email === email);
        userId = existingAuthUser?.id;
      }
    } else {
      console.error('Error al crear usuario en Auth:', authError.message);
      return;
    }
  } else {
    userId = authData?.user?.id;
  }

  if (!userId) {
    console.error('❌ ERROR CRÍTICO: No se pudo obtener el ID del usuario de ninguna fuente.');
    return;
  }

  console.log(`ID de usuario obtenido: ${userId}`);

  // 2. Asegurar que la empresa "Online System" existe
  console.log('Asegurando la empresa "Online System"...');
  let companyId: string;
  const { data: coData, error: coError } = await supabase.from('companies').upsert({
    name: 'Online System',
    rut: '77.777.777-7',
    plan: 'Corporativo'
  }, { onConflict: 'name' }).select('id').single();

  if (coError) {
    console.error('Error al asegurar la empresa:', coError.message);
    return;
  }
  companyId = coData.id;
  console.log(`ID de empresa: ${companyId}`);

  // 3. Crear o actualizar el perfil con rol Manager
  console.log('Sincronizando perfil con rol Manager...');
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    name: 'Administrador Global',
    email: email,
    role: 'Manager',
    company_id: companyId,
    avatar_url: '/avatars/1.png'
  });

  if (profileError) {
    console.error('Error al crear/actualizar el perfil:', profileError.message);
  } else {
    console.log('--------------------------------------------------');
    console.log('✅ USUARIO ADMINISTRADOR CONFIGURADO EXITOSAMENTE');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('🛡️ Rol: Manager (Acceso Total Perpétuo)');
    console.log('🏢 Empresa: Online System');
    console.log('--------------------------------------------------');
    console.log('¡Ya puedes iniciar sesión con estas credenciales!');
  }
}

createAdmin();
