"use server";

import { createClient as createSupabaseJS } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function createAdminClient() {
  return createSupabaseJS(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function createProfileAction(data: {
  name: string;
  email: string;
  role: string;
  password?: string;
  company_id?: string;
  specialty?: string;
  status?: string;
  avatar_url?: string;
}) {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Create or Find Auth User
    let userId: string;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password || 'Vanguardia_2025!',
      email_confirm: true,
      user_metadata: { name: data.name }
    });
    
    if (authError) {
      if (authError.message.includes("already been registered")) {
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) return { success: false, error: "Auth List: " + listError.message };
        const existingUser = listData.users.find(u => u.email === data.email);
        if (!existingUser) return { success: false, error: "No se encontró el usuario existente." };
        userId = existingUser.id;
      } else {
        return { success: false, error: "Auth: " + authError.message };
      }
    } else {
      userId = authData.user.id;
    }

    // 2. Upsert Profile (Update or Insert)
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      name: data.name,
      email: data.email,
      role: data.role,
      company_id: data.company_id,
      specialty: data.specialty,
      status: data.status || 'Disponible',
      avatar_url: data.avatar_url || '/avatars/3.png',
      rating: data.role === 'Técnico' ? 5.0 : null
    }, { onConflict: 'id' });

    if (profileError) {
      return { success: false, error: "Perfil: " + profileError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error desconocido al crear perfil." };
  }
}

export async function getProfilesAction(roleFilters?: string[]) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return { success: false, data: [] };

    const supabaseAdmin = createAdminClient();
    
    // 1. Obtener mi propio perfil para saber mi rol y empresa
    const { data: myProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (!myProfile) return { success: false, data: [] };

    // 2. Construir la consulta de perfiles
    let query = supabaseAdmin.from('profiles').select(`
      *,
      companies(id, name)
    `);
    // 3. Aplicar Filtro de Empresa si soy Administrador Cliente
    const myRole = myProfile.role?.trim();
    if (myRole === 'Administrador Cliente') {
      const myCompanyId = myProfile.company_id;
      if (myCompanyId) {
        query = query.eq('company_id', myCompanyId);
      } else {
        // Fallback: Si no tiene empresa asignada, un admin cliente no debería ver a nadie
        return { success: true, data: [] };
      }
    }
    // El "Administrador Full" ve a todos. 
    // Los técnicos y usuarios normales generalmente no acceden a esta acción o ven lista limitada.

    if (roleFilters && roleFilters.length > 0) {
      query = query.in('role', roleFilters);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return { success: false, data: [] };
    
    // Flatten company name
    const formattedData = data.map(u => ({
      ...u,
      company_name: u.companies?.name || 'Vanguardia',
      empresa: u.companies?.name || 'Vanguardia',
      avatarUrl: u.avatar_url || '/avatars/3.png'
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Error en getProfilesAction:", error);
    return { success: false, data: [] };
  }
}

export async function updateProfileAction(id: string, data: {
  name: string;
  role: string;
  company_id?: string;
  specialty?: string;
  status?: string;
  avatar_url?: string;
}) {
  try {
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        name: data.name,
        role: data.role,
        company_id: data.company_id,
        specialty: data.specialty,
        status: data.status,
        avatar_url: data.avatar_url
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProfileAction(id: string) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // 1. Delete Auth User (cascades to profile if DB configured, but we do both to be safe)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) return { success: false, error: "Auth: " + authError.message };

    // Profile should be gone via cascade, but verify or manual delete if not
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

