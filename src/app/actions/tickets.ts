"use server";

import { createClient as createSupabaseJS } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function createAdminClient() {
  return createSupabaseJS(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createTicketAction(data: {
    subject: string;
    description: string;
    priority: string;
    category: string;
    service_id: string;
    submitter_id: string;
    due_at: string;
    image_url?: string;
}) {
    try {
        const supabaseAdmin = createAdminClient();
        
        const now = new Date().toISOString();
        
        // Si hay una imagen, la anexamos a la descripción con un marcador especial
        let finalDescription = data.description;
        if (data.image_url) {
            finalDescription += `\n\n[ADJUNTO_IMAGEN]: ${data.image_url}`;
        }

        const { image_url, ...baseData } = data;

        const { data: ticket, error: ticketError } = await supabaseAdmin.from('tickets').insert([{
            ...baseData,
            description: finalDescription,
            status: 'Ingresado',
            created_at: now,
            updated_at: now
        }]).select('id').single();

        if (ticketError) {
            return { success: false, error: ticketError.message };
        }

        // Crear registro inicial en bitácora
        await supabaseAdmin.from('notes').insert({
            ticket_id: ticket.id,
            author_id: data.submitter_id,
            content: "[SISTEMA] Ticket creado e ingresado al catálogo de servicios operativo.",
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Error al crear ticket" };
    }
}

export async function uploadImageAction(formData: FormData) {
    try {
        const supabaseAdmin = createAdminClient();
        const file = formData.get('file') as File;
        
        if (!file) {
            return { success: false, error: "No se proporcionó ningún archivo" };
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabaseAdmin.storage
            .from('tickets')
            .upload(filePath, file);

        if (error) {
            return { success: false, error: `Error subiendo imagen: ${error.message}. Asegúrate de que el bucket 'tickets' sea público.` };
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('tickets')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };
    } catch (error: any) {
        return { success: false, error: error.message || "Error en la subida" };
    }
}

export async function updateTicketAction(id: string, data: any) {
    try {
        const supabaseAdmin = createAdminClient();
        
        const { error } = await supabaseAdmin
            .from('tickets')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar ticket" };
    }
}

export async function getTicketsAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, data: [] };

        const supabaseAdmin = createAdminClient();
        
        // 1. Obtener el perfil del usuario para conocer su rol y empresa
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) return { success: false, data: [] };

        const role = profile.role?.trim();
        const empresaId = profile.company_id; // Sincronizado con DB

        // 2. Construir query base
        let query = supabaseAdmin.from('tickets').select('*');

        // 3. Aplicar filtros según el ROL
        if (role === 'Técnico') {
            // El técnico solo ve lo que tiene asignado
            query = query.eq('tecnico_asignado_id', user.id);
        } else if (role === 'Administrador Cliente') {
            // El admin cliente ve todo de su empresa
            if (empresaId) {
                query = query.eq('company_id', empresaId);
            } else {
                // Fallback de seguridad: si no tiene empresa, no ve nada
                return { success: true, data: [] };
            }
        } else if (role === 'Usuario') {
            // El cliente solo ve lo que él creó
            query = query.eq('creador_id', user.id);
        }
        // El 'Administrador Full' no tiene filtros adicionales

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Formatear fechas para el frontend
        const formattedData = data.map(t => ({
            ...t,
            createdAt: new Date(t.created_at),
            updatedAt: new Date(t.updated_at),
            dueAt: new Date(t.due_at),
            resolvedAt: t.resolved_at ? new Date(t.resolved_at) : null,
            submitterId: t.creador_id || t.submitter_id,
            assigneeId: t.tecnico_asignado_id || t.assignee_id,
        }));

        return { success: true, data: formattedData };
    } catch (error: any) {
        console.error("Error en getTicketsAction:", error);
        return { success: false, data: [], error: error.message };
    }
}

export async function getNotesAction(ticketId: string) {
    try {
        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin
            .from('notes')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || "Error al obtener notas" };
    }
}

export async function createNoteAction(ticketId: string, authorId: string, content: string) {
    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from('notes').insert({
            ticket_id: ticketId,
            author_id: authorId,
            content: content
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Error al crear nota" };
    }
}
export async function getTicketAction(id: string) {
    try {
        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || "Error al obtener ticket" };
    }
}
