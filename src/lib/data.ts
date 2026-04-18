import { Note, Ticket, User } from './definitions';

export const empresas = [
    { id: "EMP-001", nombre: "Vanguardia SpA", rut: "76.000.000-1", plan: "Corporativo", estado: "Activo", usuarios: 15 },
    { id: "EMP-002", nombre: "TechNova Solutions", rut: "76.123.456-7", plan: "Premium", estado: "Activo", usuarios: 12 },
    { id: "EMP-003", nombre: "Inversiones del Norte", rut: "77.987.654-3", plan: "Básico", estado: "Inactivo", usuarios: 3 },
    { id: "EMP-004", nombre: "Logística Express", rut: "99.456.789-0", plan: "Pro", estado: "Activo", usuarios: 25 },
];

export const EMPRESAS_PERMITIDAS = empresas.map(e => e.nombre);

export const SERVICE_CATALOG = [
    { id: "caida_sistema", nombre: "Caída Crítica de Sistema / Servidor", category: "Hardware", priority: "Crítica", slaHours: 4 },
    { id: "problemas_red", nombre: "Intermitencia o Caída de Red", category: "Redes", priority: "Alta", slaHours: 12 },
    { id: "falla_software", nombre: "Falla de Software o Error en App", category: "Software", priority: "Media", slaHours: 48 },
    { id: "accesos", nombre: "Recuperación de Accesos o Contraseñas", category: "Accesos", priority: "Baja", slaHours: 72 },
    { id: "soporte_general", nombre: "Consultas de Soporte General", category: "Otro", priority: "Baja", slaHours: 72 },
];

export const users: User[] = [
  { id: 'USR-1', name: 'Ramiro Contreras', email: 'rcontreras@vanguardia.cl', avatarUrl: '/avatars/1.png', role: 'Administrador Full', empresa: 'Vanguardia SpA', password: 'vanguardia2024' },
  { id: 'USR-2', name: 'Antonia Paz', email: 'apaz@vanguardia.cl', avatarUrl: '/avatars/2.png', role: 'Técnico', empresa: 'Vanguardia SpA', password: 'vanguardia2024' },
  { id: 'USR-3', name: 'Juan Manuel Soporte', email: 'jms@vanguardia.cl', avatarUrl: '/avatars/3.png', role: 'Técnico', empresa: 'Vanguardia SpA', password: 'vanguardia2024' },
  { id: 'USR-4', name: 'Claudio Garrido', email: 'cgarrido@alphacorp.cl', avatarUrl: '/avatars/4.png', role: 'Usuario', empresa: 'TechNova Solutions', password: 'alpha2024' },
  { id: 'USR-5', name: 'Jorge Ramírez', email: 'jramirez@vanguardia.cl', avatarUrl: '/avatars/5.png', role: 'Técnico', empresa: 'Vanguardia SpA', password: 'vanguardia2024' },
  { id: 'USR-6', name: 'Lucía Fernández', email: 'lfernandez@vanguardia.cl', avatarUrl: '/avatars/6.png', role: 'Técnico', empresa: 'Vanguardia SpA', password: 'vanguardia2024' },
  { id: 'USR-7', name: 'Carlos TechNova', email: 'carlos@technova.com', avatarUrl: '/avatars/1.png', role: 'Administrador Cliente', empresa: 'TechNova Solutions', password: 'tech2024' },
];

export const tecnicos = [
  { id: "USR-5", nombre: "Jorge Ramírez", especialidad: "Soporte Nivel 1", ticketsActivos: 3, estado: "Disponible", rating: 4.8 },
  { id: "USR-6", nombre: "Lucía Fernández", especialidad: "Infraestructura", ticketsActivos: 5, estado: "En Terreno", rating: 4.9 },
  { id: "USR-2", nombre: "Antonia Paz", especialidad: "Redes y Servidores", ticketsActivos: 1, estado: "Disponible", rating: 5.0 },
  { id: "USR-3", nombre: "Juan Manuel Soporte", especialidad: "Soporte Nivel 2", ticketsActivos: 0, estado: "Disponible", rating: 4.7 },
];

export const getLeastBusyTech = () => {
    return [...tecnicos].sort((a, b) => a.ticketsActivos - b.ticketsActivos)[0];
};

export const tickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'No puedo conectar al Wi-Fi de la empresa',
    description: 'Mi laptop no se puede conectar a la red "Corporate". Ya intenté reiniciar la máquina.',
    status: 'Ingresado',
    priority: 'Alta',
    category: 'Redes',
    createdAt: new Date('2023-10-26T10:00:00Z'),
    updatedAt: new Date('2023-10-26T10:00:00Z'),
    dueAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Vence mañana (Verde)
    resolvedAt: null,
    submitterId: 'USR-4',
    assigneeId: 'USR-1',
  },
  {
    id: 'TKT-002',
    subject: 'Solicitud licencia Photoshop',
    description: 'Necesito una licencia de Adobe Photoshop para diseño. Aprobada por gerente.',
    status: 'En proceso',
    priority: 'Media',
    category: 'Software',
    createdAt: new Date('2023-10-26T11:30:00Z'),
    updatedAt: new Date('2023-10-27T14:00:00Z'),
    dueAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Venció ayer (Amarillo)
    resolvedAt: null,
    submitterId: 'USR-4',
    assigneeId: 'USR-2',
  },
  {
    id: 'TKT-003',
    subject: 'Impresora no funciona',
    description: 'La impresora principal muestra "Atasco de papel" pero no se ven hojas atoradas.',
    status: 'Espera de aprobación',
    priority: 'Media',
    category: 'Hardware',
    createdAt: new Date('2023-10-25T09:00:00Z'),
    updatedAt: new Date('2023-10-25T15:45:00Z'),
    dueAt: new Date(new Date().getTime() + 48 * 60 * 60 * 1000), // Vence en 2 días (Verde)
    resolvedAt: null,
    submitterId: 'USR-4',
    assigneeId: 'USR-1',
  },
  {
    id: 'TKT-004',
    subject: 'Reset de contraseña CRM',
    description: 'Olvidé mi contraseña y estoy bloqueado fuera del sistema.',
    status: 'Terminado',
    priority: 'Crítica',
    category: 'Cuentas',
    createdAt: new Date('2023-10-24T16:20:00Z'),
    updatedAt: new Date('2023-10-24T16:50:00Z'),
    dueAt: new Date('2023-10-24T20:20:00Z'), // Vencía a las 20:20
    resolvedAt: new Date('2023-10-24T16:50:00Z'), // Resuelto ANTES (Azul)
    submitterId: 'USR-4',
    assigneeId: 'USR-2',
  },
  {
    id: 'TKT-005',
    subject: 'Correo sospechoso',
    description: 'Recibí un correo falso que finge ser del CEO.',
    status: 'Terminado',
    priority: 'Alta',
    category: 'Seguridad',
    createdAt: new Date('2023-10-27T13:00:00Z'),
    updatedAt: new Date('2023-10-27T13:05:00Z'),
    dueAt: new Date('2023-10-27T17:00:00Z'), // Vencía el mismo día a las 17
    resolvedAt: new Date('2023-10-28T10:00:00Z'), // Se resolvió AL DÍA SIGUIENTE! Tarde (Rojo)
    submitterId: 'USR-4',
    assigneeId: 'USR-3',
  },
  {
    id: 'TKT-006',
    subject: 'Pantalla parpadea',
    description: 'Mi pantalla secundaria parpadea mucho, revisé los cables y están bien.',
    status: 'En proceso',
    priority: 'Baja',
    category: 'Hardware',
    createdAt: new Date('2023-10-27T15:00:00Z'),
    updatedAt: new Date('2023-10-27T15:00:00Z'),
    dueAt: new Date(new Date().getTime() + 72 * 60 * 60 * 1000), // Vence en 3 dias
    resolvedAt: null,
    submitterId: 'USR-4',
    assigneeId: null,
  },
];

export const notes: Note[] = [
    {
        id: 'NOTE-001',
        ticketId: 'TKT-001',
        authorId: 'USR-1',
        content: "Checked user's device settings. It seems to be a profile corruption issue. Will attempt to re-provision the Wi-Fi profile.",
        createdAt: new Date('2023-10-26T10:30:00Z'),
    },
    {
        id: 'NOTE-002',
        ticketId: 'TKT-002',
        authorId: 'USR-2',
        content: 'Photoshop license has been procured. Sending installation instructions to the user.',
        createdAt: new Date('2023-10-27T14:00:00Z'),
    },
    {
        id: 'NOTE-003',
        ticketId: 'TKT-003',
        authorId: 'USR-1',
        content: 'Found a small piece of paper stuck deep inside the printer roller. Removed it and tested the printer. It is now functioning correctly.',
        createdAt: new Date('2023-10-25T15:40:00Z'),
    },
    {
        id: 'NOTE-004',
        ticketId: 'TKT-003',
        authorId: 'USR-1',
        content: 'Resolved. The printer is back online.',
        createdAt: new Date('2023-10-25T15:45:00Z'),
    },
    {
        id: 'NOTE-005',
        ticketId: 'TKT-004',
        authorId: 'USR-2',
        content: "User's account has been unlocked and a temporary password has been sent via secure channel.",
        createdAt: new Date('2023-10-24T16:45:00Z'),
    },
];
