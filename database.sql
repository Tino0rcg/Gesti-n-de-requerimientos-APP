-- ==========================================================
-- SCRIPT MAESTRO DE BASE DE DATOS - GESTOR DE REQUERIMIENTOS
-- Sincronizado con Server Actions y Roles en Español
-- ==========================================================

-- 0. LIMPIEZA (Borra todo para empezar de cero)
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. TABLAS

-- Empresas (Tenants)
create table public.companies (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    rut text unique not null,
    plan text default 'Básico',
    status text default 'Activo',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Perfiles Extendidos (Enlazados con auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    email text unique not null,
    role text not null check (role in ('Administrador Full', 'Administrador Cliente', 'Técnico', 'Usuario')),
    company_id uuid references public.companies(id) on delete set null,
    specialty text,
    status text default 'Disponible',
    avatar_url text,
    rating float,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Catálogo de Servicios (ANS)
create table public.services (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    category text not null,
    priority text not null check (priority in ('Baja', 'Media', 'Alta', 'Crítica')),
    sla_hours integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tickets (Requerimientos)
create table public.tickets (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid references public.companies(id) on delete cascade not null,
    service_id uuid references public.services(id) on delete cascade not null,
    creador_id uuid references public.profiles(id) on delete cascade not null,
    tecnico_asignado_id uuid references public.profiles(id) on delete set null,
    subject text not null,
    description text not null,
    status text not null default 'Ingresado' check (status in ('Ingresado', 'En proceso', 'Espera de aprobación', 'Terminado')),
    priority text not null default 'Media' check (priority in ('Baja', 'Media', 'Alta', 'Crítica')),
    image_url text,
    due_at timestamp with time zone not null,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notas y Bitácora (Chat de Ticket)
create table public.notes (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references public.tickets(id) on delete cascade not null,
    author_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SEGURIDAD (RLS)

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.tickets enable row level security;
alter table public.notes enable row level security;

-- Políticas simplificadas (El acceso real lo gestionan las Server Actions via Service Role)
create policy "Select general para autenticados" on public.companies for select using (auth.role() = 'authenticated');
create policy "Select general perfiles para autenticados" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Select general servicios para todos" on public.services for select using (true);
create policy "Select general tickets para autenticados" on public.tickets for select using (auth.role() = 'authenticated');
create policy "Select general notas para autenticados" on public.notes for select using (auth.role() = 'authenticated');

-- 4. TRIGGERS (Actualización automática de updated_at)

create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.tickets
for each row
execute function handle_updated_at();

-- 5. DATOS INICIALES (SEED)

-- Insertar Empresa Principal
insert into public.companies (id, name, rut, plan, status)
values ('00000000-0000-0000-0000-000000000001', 'Vanguardia SpA', '76.000.000-1', 'Corporativo', 'Activo');

-- Insertar Catálogo Base de Servicios
insert into public.services (name, category, priority, sla_hours) values
('Caída de Sistema / Servidor', 'Hardware', 'Crítica', 4),
('Intermitencia de Red', 'Redes', 'Alta', 12),
('Falla de Software Corporativo', 'Software', 'Media', 48),
('Recuperación de Contraseñas', 'Accesos', 'Baja', 72);

-- ==========================================================
-- SEED DE USUARIO ADMINISTRADOR (PROCESO ROBUSTO)
-- ==========================================================

DO $$
DECLARE
    admin_id uuid := '11111111-1111-1111-1111-111111111111';
    company_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- 1. Crear el usuario en auth.users si no existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            role, confirmation_token, email_change, email_change_sent_at, last_sign_in_at
        )
        VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@vanguardia.cl',
            extensions.crypt('Admin_Vanguardia_2025!', extensions.gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Administrador Maestro"}',
            now(),
            now(),
            'authenticated',
            '',
            '',
            now(),
            now()
        );

        -- 2. Vincular Identidad (Requerido para login)
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (
            uuid_generate_v4(),
            admin_id,
            format('{"sub":"%s","email":"%s"}', admin_id, 'admin@vanguardia.cl')::jsonb,
            'email',
            admin_id, -- provider_id es el UUID para el provider email
            now(),
            now(),
            now()
        );
    END IF;

    -- 3. Asegurar el Perfil en la tabla pública
    INSERT INTO public.profiles (id, name, email, role, company_id, status)
    VALUES (
        admin_id,
        'Administrador Maestro',
        'admin@vanguardia.cl',
        'Administrador Full',
        company_id,
        'Disponible'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        company_id = EXCLUDED.company_id;

END $$;
