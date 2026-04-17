"use client";

import { useState } from "react";
import { Ticket, User, Note, TicketStatus } from "@/lib/definitions";
import { tickets, users, notes as initialNotes } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, UserIcon, AlertCircle, Play, CheckCircle2, XCircle, Send, UserCheck } from "lucide-react";
import { getSlaStatus } from "@/lib/sla-utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { sendTicketNotification } from "@/app/actions/notifications";

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
  const initialTicket = tickets.find((t) => t.id === ticketId);

  // States para Mockup de UI
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>(initialTicket?.status || 'Ingresado');
  const [chatNotes, setChatNotes] = useState<Note[]>(initialNotes.filter((n) => n.ticketId === ticketId));
  const [newMessage, setNewMessage] = useState("");
  const [assigneeId, setAssigneeId] = useState(initialTicket?.assigneeId || "");

  if (!initialTicket) return <div className="p-4 text-center">Ticket no encontrado</div>;

  const submitter = users.find((u) => u.id === initialTicket.submitterId);
  const assignee = users.find((u) => u.id === (assigneeId || initialTicket.assigneeId));
  
  // Fake calculation using the dynamic status instead of initial object
  const simTicket = { ...initialTicket, status: ticketStatus };
  const sla = getSlaStatus(simTicket);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const newNote: Note = {
      id: `NOTE-NEW-${Date.now()}`,
      ticketId: initialTicket!.id,
      authorId: 'USR-2', // Simular que somos Técnico/Agente por default
      content: newMessage,
      createdAt: new Date(),
    };
    initialNotes.push(newNote); // Guardar permanentemente en memoria mock
    setChatNotes([...chatNotes, newNote]);
    setNewMessage("");
    if (onUpdate) onUpdate();
    
    // Disparar en background
    sendTicketNotification(initialTicket!.id, "Nuevo mensaje en bitácora");
  };

  const handleReassign = (newAssigneeId: string) => {
    const globalTicket = tickets.find(t => t.id === initialTicket!.id);
    if (globalTicket) {
        globalTicket.assigneeId = newAssigneeId;
        globalTicket.updatedAt = new Date();
    }
    setAssigneeId(newAssigneeId);
    if (onUpdate) onUpdate();

    const newTechName = users.find(u => u.id === newAssigneeId)?.name || "un nuevo técnico";
    sendTicketNotification(initialTicket!.id, `🔄 Cambio de Responsable: Su requerimiento ha sido re-asignado a ${newTechName}.`);
  };

  const handleAction = (newStatus: TicketStatus, autoMessage?: string) => {
    // Buscar y alterar directamente el objeto en memoria global
    const globalTicket = tickets.find(t => t.id === initialTicket!.id);
    if (globalTicket) {
        globalTicket.status = newStatus;
        globalTicket.updatedAt = new Date(); // Actualizamos el timestamp para congelar el reloj si es necesario
        if (newStatus === "Terminado") globalTicket.resolvedAt = new Date();
    }

    setTicketStatus(newStatus);
    if (autoMessage) {
        const autoNote: Note = {
            id: `NOTE-SYS-${Date.now()}`,
            ticketId: initialTicket!.id,
            authorId: 'USR-1', // Manager o admin
            content: autoMessage,
            createdAt: new Date(),
        };
        initialNotes.push(autoNote); // Guardar en memoria global
        setChatNotes([...chatNotes, autoNote]);
    }
    if (onUpdate) onUpdate();

    // Disparar en background
    sendTicketNotification(initialTicket!.id, autoMessage ? `Cambio de Estado: ${newStatus}` : `Estado actualizado a ${newStatus}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <SheetHeader className="mb-4 flex-none">
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs bg-muted/30">#{initialTicket.id}</Badge>
            <Badge variant="outline" className={`text-xs ${statusColorMap[ticketStatus]}`}>{ticketStatus}</Badge>
            <Badge variant="outline" className={priorityColorMap[initialTicket.priority]}>{initialTicket.priority}</Badge>
            
            <div className={`flex items-center gap-1.5 ml-auto px-2 py-0.5 rounded-full bg-muted/20 border border-border/50`}>
                <div title={sla.label} className={`h-2 w-2 rounded-full ${sla.color}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider">{sla.label}</span>
            </div>
        </div>
        <SheetTitle className="text-xl font-bold leading-tight text-white">{initialTicket.subject}</SheetTitle>
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
                <span>Registrado el {format(initialTicket.createdAt, "dd/MM/yyyy HH:mm")}</span>
            </div>
            <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Módulo: {initialTicket.category}</span>
            </div>
        </div>
      </SheetHeader>

      {/* Controles de Flujo de Trabajo (Workflow Panel) */}
      <div className="mb-6 flex-none bg-gradient-to-r from-muted/20 to-muted/5 border border-white/10 rounded-xl p-4">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Flujo de Trabajo Operativo</h4>
        <div className="flex flex-wrap gap-2">
            {ticketStatus === 'Ingresado' && (
                <Button onClick={() => handleAction('En proceso', '⚙️ Ticket marcado como "En Proceso" por el técnico. Comenzando a trabajar en la solución.')} size="sm" className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30">
                    <Play className="w-4 h-4 mr-2" /> Iniciar Trabajo (Agente)
                </Button>
            )}
            
            {ticketStatus === 'En proceso' && (
                <Button onClick={() => handleAction('Espera de aprobación', '⏳ Trabajo finalizado por el técnico. Enviado al cliente para revisión y control de calidad.')} size="sm" className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30">
                    <AlertCircle className="w-4 h-4 mr-2" /> Enviar a Revisión (Al Cliente)
                </Button>
            )}

            {ticketStatus === 'Espera de aprobación' && (
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

            {ticketStatus === 'Terminado' && (
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
                <Select value={assigneeId} onValueChange={handleReassign}>
                    <SelectTrigger className="h-8 bg-black/40 border-white/5 text-xs text-zinc-300">
                        <SelectValue placeholder="Seleccionar técnico..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                        {users.filter(u => u.role === 'Agent' || u.role === 'Manager').map(u => (
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
                {initialTicket.description}
            </p>
        </div>

        {/* Chat / Bitácora (El historial de actividad interactiva) */}
        <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <MessageSquare className="h-4 w-4" /> Conversación Intercom
            </h3>
            
            {chatNotes.length === 0 ? (
                <div className="text-sm text-center py-6 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                    Sin respuestas en este ticket. ¡Inicia la conversación!
                </div>
            ) : (
                <div className="space-y-4">
                    {chatNotes.map(n => {
                        const autor = users.find(u => u.id === n.authorId);
                        // Estilizar diferente si el autor es quien abrió el ticket (Cliente/Submitter) o es un Agente
                        const esSubmitter = n.authorId === initialTicket.submitterId;
                        
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
                placeholder={ticketStatus === 'Espera de aprobación' ? "Explica el motivo (Si rechazas) o agradece (Si apruebas)..." : "Responde al técnico o agrega detalles..."}
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
            <Button onClick={sendMessage} disabled={!newMessage.trim()} className="h-auto shrink-0 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                <Send className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
