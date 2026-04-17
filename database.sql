-- Esquema de Base de Datos PostgreSQL para Gestor de Requerimientos Multi-Tenant

-- 1. EXTENSIONES
-- Requerido para UUIDs
create extension if not exists "uuid-ossp";

-- 2. TABLAS

-- Empresas (Tenants)
create table public.empresas (
    id uuid primary key default uuid_generate_v4(),
    nombre text not null,
    rut text unique not null,
    plan text default 'Básico',
    estado text default 'Activo',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Perfiles Extendidos (se enlazan con auth.users de Supabase)
-- Aquí definiremos si son Admin, Técnicos o Clientes.
create table public.perfiles (
    id uuid primary key references auth.users(id) on delete cascade,
    empresa_id uuid references public.empresas(id) on delete set null,
    nombre text not null,
    rol text not null check (rol in ('Administrador Full', 'Administrador Cliente', 'Técnico', 'Usuario')),
    especialidad text,
    estado_operativo text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Servicios (Catálogo de lo que se arregla/presta)
create table public.servicios (
    id uuid primary key default uuid_generate_v4(),
    nombre text not null,
    categoria text not null,
    sla text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tickets / Requerimientos principales
create table public.tickets (
    id uuid primary key default uuid_generate_v4(),
    empresa_id uuid references public.empresas(id) on delete cascade not null,
    servicio_id uuid references public.servicios(id) on delete cascade not null,
    creador_id uuid references public.perfiles(id) on delete cascade not null,
    tecnico_asignado_id uuid references public.perfiles(id) on delete set null,
    asunto text not null,
    descripcion text not null,
    estado text not null default 'Ingresado' check (estado in ('Ingresado', 'En proceso', 'Espera de aprobación', 'Terminado')),
    prioridad text not null default 'Media' check (prioridad in ('Baja', 'Media', 'Alta', 'Crítica')),
    due_at timestamp with time zone not null,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. POLÍTICAS DE SEGURIDAD PARA RLS (Row Level Security)

-- Encender RLS en las tablas
alter table public.empresas enable row level security;
alter table public.perfiles enable row level security;
alter table public.servicios enable row level security;
alter table public.tickets enable row level security;

-- (Puedes definir políticas personalizadas para asegurar que los usuarios solo vean los tickets de su empresa. Por el momento agregaremos una base para que puedas leer todo si estás autenticado)

create policy "Lectura general de empresas para autenticados" 
on public.empresas for select using (auth.role() = 'authenticated');

create policy "Lectura de perfiles para autenticados" 
on public.perfiles for select using (auth.role() = 'authenticated');

create policy "Servicios son públicos" 
on public.servicios for select using (true);

create policy "Lectura de tickets para autenticados" 
on public.tickets for select using (auth.role() = 'authenticated');
