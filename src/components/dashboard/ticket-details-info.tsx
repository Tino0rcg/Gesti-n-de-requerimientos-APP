"use client";

import { useEffect, useState } from "react";
import { Ticket, User, Note, TicketStatus } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, UserIcon, AlertCircle, Play, CheckCircle2, XCircle, Send, UserCheck, Loader2 } from "lucide-react";
import { getSlaStatus } from "@/lib/sla-utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { sendTicketNotification } from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/client";

interface Props {
  ticketId: string;
  onUpdate?: () => void;
}

const priorityColorMap: Record<string, string> = {
  Baja: "bg-green-500/20 text-green-400 border border-green-500/30",
  Media: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Alta: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  Crítica: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const statusColorMap: Record<string, string> = {
    'Ingresado': "bg-blue-500/10 text-blue-400 border-blue-500/20",
    'En proceso': "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    'Espera de aprobación': "bg-purple-500/10 text-purple-400 border-purple-500/20",
    'Terminado': "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function TicketDetailsInfo({ ticketId, onUpdate }: Props) {
  const supabase = createClient();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function fetchData() {
    try {
        setLoading(true);
        // 1. Ticket
        const { data: ticketData } = await supabase.from('tickets').select('*').eq('id', ticketId).single();
        if (ticketData) {
            setTicket({
                ...ticketData,
                createdAt: new Date(ticketData.created_at),
                updatedAt: new Date(ticketData.updated_at),
                dueAt: new Date(ticketData.due_at),
                resolvedAt: ticketData.resolved_at ? new Date(ticketData.resolved_at) : null,
                submitterId: ticketData.submitter_id,
                assigneeId: ticketData.assignee_id,
            });
        }

        // 2. Perfiles (Para saber nombres de autores y técnicos)
        const { data: profilesData } = await supabase.from('profiles').select('*');
        if (profilesData) setProfiles(profilesData as User[]);

        // 3. Notas
        const { data: notesData } = await supabase
            .from('notes')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        
        if (notesData) {
            setNotes(notesData.map(n => ({
                ...n,
                ticketId: n.ticket_id,
                authorId: n.author_id,
                createdAt: new Date(n.created_at),
            })));
        }
    } catch (err) {
        console.error("Error loading ticket details:", err);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  if (loading) {
    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="mb-4 flex-none">
                <SheetTitle className="text-xl font-bold leading-tight text-white/50 animate-pulse">Cargando requerimiento...</SheetTitle>
            </SheetHeader>
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        </div>
    );
  }

  if (!ticket) return <div className="p-4 text-center">Ticket no encontrado</div>;

  const submitter = profiles.find((u) => u.id === ticket.submitterId);
  const assignee = profiles.find((u) => u.id === ticket.assigneeId);
  const sla = getSlaStatus(ticket);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { error } = await supabase.from('notes').insert({
            ticket_id: ticketId,
            author_id: userData.user.id,
            content: newMessage,
        });

        if (!error) {
            setNewMessage("");
            fetchData();
            if (onUpdate) onUpdate();
            // Disparar email en background
            sendTicketNotification(ticketId, "Nuevo mensaje en bitácora");
        }
    } finally {
        setSending(false);
    }
  };

  const handleReassign = async (newAssigneeId: string) => {
    const { error } = await supabase
        .from('tickets')
        .update({ 
            assignee_id: newAssigneeId,
            updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

    if (!error) {
        fetchData();
        if (onUpdate) onUpdate();
        const newTechName = profiles.find(u => u.id === newAssigneeId)?.name || "un nuevo técnico";
        sendTicketNotification(ticketId, `🔄 Cambio de Responsable: Su requerimiento ha sido re-asignado a ${newTechName}.`);
    }
  };

  const handleAction = async (newStatus: TicketStatus, autoMessage?: string) => {
    const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
    };
    if (newStatus === "Terminado") updateData.resolved_at = new Date().toISOString();

    const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

    if (!error) {
        if (autoMessage) {
            const { data: userData } = await supabase.auth.getUser();
            await supabase.from('notes').insert({
                ticket_id: ticketId,
                author_id: userData.user?.id,
                content: autoMessage,
            });
        }
        fetchData();
        if (onUpdate) onUpdate();
        // Disparar email en background
        sendTicketNotification(ticketId, autoMessage ? `Cambio de Estado: ${newStatus}` : `Estado actualizado a ${newStatus}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <SheetHeader className="mb-4 flex-none">
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs bg-muted/30">#{ticket.id}</Badge>
            <Badge variant="outline" className={`text-xs ${statusColorMap[ticket.status]}`}>{ticket.status}</Badge>
            <Badge variant="outline" className={priorityColorMap[ticket.priority]}>{ticket.priority}</Badge>
            
            <div className={`flex items-center gap-1.5 ml-auto px-2 py-0.5 rounded-full bg-muted/20 border border-border/50`}>
                <div title={sla.label} className={`h-2 w-2 rounded-full ${sla.color}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider">{sla.label}</span>
            </div>
        </div>
        <SheetTitle className="text-xl font-bold leading-tight text-white">{ticket.subject}</SheetTitle>
        <div className="flex flex-col gap-1 mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 font-medium">Solicitante:</span>
                <span className="text-white font-bold">{submitter?.name || "Desconocido"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 font-medium">Empresa:</span>
                <span className="text-primary font-black tracking-tight italic uppercase">{submitter?.empresa || "Externo"}</span>
            </div>
        </div>
        <div className="flex items-center text-[10px] text-muted-foreground mt-3 gap-3 opacity-70">
            <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Registrado el {format(ticket.createdAt, "dd/MM/yyyy HH:mm")}</span>
            </div>
            <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Módulo: {ticket.category}</span>
            </div>
        </div>
      </SheetHeader>

      {/* Controles de Flujo de Trabajo (Workflow Panel) */}
      <div className="mb-6 flex-none bg-gradient-to-r from-muted/20 to-muted/5 border border-white/10 rounded-xl p-4">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Flujo de Trabajo Operativo</h4>
        <div className="flex flex-wrap gap-2">
            {ticket.status === 'Ingresado' && (
                <Button onClick={() => handleAction('En proceso', '⚙️ Ticket marcado como "En Proceso" por el técnico. Comenzando a trabajar en la solución.')} size="sm" className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30">
                    <Play className="w-4 h-4 mr-2" /> Iniciar Trabajo (Agente)
                </Button>
            )}
            
            {ticket.status === 'En proceso' && (
                <Button onClick={() => handleAction('Espera de aprobación', '⏳ Trabajo finalizado por el técnico. Enviado al cliente para revisión y control de calidad.')} size="sm" className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30">
                    <AlertCircle className="w-4 h-4 mr-2" /> Enviar a Revisión (Al Cliente)
                </Button>
            )}

            {ticket.status === 'Espera de aprobación' && (
                <>
                    <Button onClick={() => handleAction('Terminado', '✅ Solución validada y aceptada por el cliente. Ticket cerrado exitosamente.')} size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Aprobar Solución
                    </Button>
                    <div className="group relative">
                        <Button 
                            disabled={!newMessage.trim()} 
                            onClick={() => {
                                handleAction('En proceso', `❌ Solución RECHAZADA por el cliente.\n\nMotivo del rechazo: ${newMessage}`);
                                setNewMessage(""); // Limpiar caja después
                            }} 
                            size="sm" 
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Rechazar Solución
                        </Button>
                        {!newMessage.trim() && (
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-red-400 opacity-0 transition-opacity group-hover:opacity-100 border border-red-500/20">
                                Escribe el motivo abajo para poder rechazar
                            </span>
                        )}
                    </div>
                </>
            )}

            {ticket.status === 'Terminado' && (
                <div className="text-sm font-medium text-green-400 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Este requerimiento ha finalizado exitosamente.
                </div>
            )}
        </div>
      </div>

      {/* Panel de Asignación (Admin Only UI) */}
      <div className="mb-6 flex-none bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Control de Asignación</h4>
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                    <AvatarImage src={assignee?.avatarUrl} />
                    <AvatarFallback className="bg-blue-500/20 text-blue-400">{assignee?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{assignee?.name || "Sin Asignar"}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{assignee?.role === 'Agent' ? 'Técnico Especialista' : 'Supervisor'}</p>
                </div>
            </div>
            <div className="pt-2 border-t border-blue-500/10">
                <Label className="text-[10px] text-zinc-500 mb-1.5 block">Cambiar responsable del caso:</Label>
                <Select value={ticket.assigneeId || ""} onValueChange={handleReassign}>
                    <SelectTrigger className="h-8 bg-black/40 border-white/5 text-xs text-zinc-300">
                        <SelectValue placeholder="Seleccionar técnico..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                        {profiles.filter(u => u.role === 'Agent' || u.role === 'Manager').map(u => (
                            <SelectItem key={u.id} value={u.id} className="text-xs focus:bg-blue-500/20 focus:text-blue-200">
                                {u.name} ({u.empresa})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        {/* Descripcion Completa */}
        <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-primary">Descripción General</h3>
            <p className="text-sm border-l-2 border-primary/50 pl-4 py-2 bg-muted/10 text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
            </p>
        </div>

        {/* Chat / Bitácora (El historial de actividad interactiva) */}
        <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <MessageSquare className="h-4 w-4" /> Conversación Intercom
            </h3>
            
            {notes.length === 0 ? (
                <div className="text-sm text-center py-6 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                    Sin respuestas en este ticket. ¡Inicia la conversación!
                </div>
            ) : (
                <div className="space-y-4">
                    {notes.map(n => {
                        const autor = profiles.find(u => u.id === n.authorId);
                        const esSubmitter = n.authorId === ticket.submitterId;
                        
                        return (
                            <div key={n.id} className={`flex gap-3 ${esSubmitter ? 'flex-row' : 'flex-row-reverse'}`}>
                                <Avatar className="h-8 w-8 mt-1 border border-white/10 shrink-0">
                                    <AvatarImage src={autor?.avatarUrl} />
                                    <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col max-w-[85%] ${esSubmitter ? 'items-start' : 'items-end'}`}>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-[11px] font-bold text-white/90">{autor?.name}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-500 font-medium uppercase tracking-tighter">
                                            {autor?.empresa}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/50 ml-auto">{format(n.createdAt, "HH:mm")}</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${
                                        esSubmitter 
                                        ? 'bg-muted/30 text-foreground rounded-tl-sm' 
                                        : 'bg-primary/20 text-primary shadow-lg shadow-primary/5 border border-primary/20 rounded-tr-sm'
                                    }`}>
                                        <p className="whitespace-pre-wrap">{n.content}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      </ScrollArea>

      {/* Input de Mensajes */}
      <div className="flex-none pt-4 border-t border-white/10 mt-auto">
        <div className="flex gap-2">
            <Textarea
                placeholder={ticket.status === 'Espera de aprobación' ? "Explica el motivo (Si rechazas) o agradece (Si apruebas)..." : "Responde al técnico o agrega detalles..."}
                className="resize-none min-h-[60px] bg-black/20 border-white/10 text-sm py-3"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="h-auto shrink-0 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
        </div>
      </div>
    </div>
  );
}
