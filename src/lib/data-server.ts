import { Note, Ticket, User } from './definitions';
import { createClient } from './supabase/server';
import { tickets, users, empresas, SERVICE_CATALOG } from './data';

// FUNCIONES DE CARGA REAL DESDE SUPABASE (SERVERONLY)
export async function getTickets(): Promise<Ticket[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching tickets:', error);
        return tickets; // Fallback a mock data si falla
    }
    
    return data.map(t => ({
        ...t,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
        dueAt: new Date(t.due_at),
        resolvedAt: t.resolved_at ? new Date(t.resolved_at) : null,
    })) as Ticket[];
}

export async function getUsers(): Promise<User[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*');
    
    if (error) {
        console.error('Error fetching users:', error);
        return users;
    }
    
    return data.map(u => ({
        ...u,
        avatarUrl: u.avatar_url,
    })) as User[];
}

export async function getCompanies() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('companies')
        .select('*');
    
    if (error) return empresas;
    return data;
}

export async function getServices() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('services')
        .select('*');
    
    if (error) return SERVICE_CATALOG;
    return data;
}

export async function getTicketNotes(ticketId: string): Promise<Note[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
    
    return data.map(n => ({
        ...n,
        ticketId: n.ticket_id,
        authorId: n.author_id,
        createdAt: new Date(n.created_at),
    })) as Note[];
}
