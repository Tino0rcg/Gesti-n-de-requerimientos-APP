"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, User, TicketPriority, TicketStatus } from "@/lib/definitions";
import { format } from "date-fns";
import { Clock, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TicketDetailsInfo } from "@/components/dashboard/ticket-details-info";
import { getSlaStatus } from "@/lib/sla-utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COLUMNS: TicketStatus[] = ['Ingresado', 'En proceso', 'Espera de aprobación', 'Terminado'];

const priorityColorMap: { [key in TicketPriority]: string } = {
    Baja: "bg-green-500/20 text-green-400 border border-green-500/30",
    Media: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Alta: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    Crítica: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function KanbanTicketsPage() {
    const supabase = createClient();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [profiles, setProfiles] = useState<User[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Tickets
            const { data: ticketsData } = await supabase.from('tickets').select('*');
            if (ticketsData) {
                setTickets(ticketsData.map(t => ({
                    ...t,
                    createdAt: new Date(t.created_at),
                    updatedAt: new Date(t.updated_at),
                    dueAt: new Date(t.due_at),
                    resolvedAt: t.resolved_at ? new Date(t.resolved_at) : null,
                    submitterId: t.submitter_id,
                    assigneeId: t.assignee_id,
                })));
            }
            // 2. Fetch Profiles (for names in cards)
            const { data: profilesData } = await supabase.from('profiles').select('*');
            if (profilesData) setProfiles(profilesData as User[]);
        } catch (err) {
            console.error("Error fetching Kanban data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshCount]);

    const getSubmitter = (id: string) => profiles.find(u => u.id === id);

    return (
        <div className="flex flex-col gap-6 h-full pb-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tablero de Requerimientos</h1>
                    <p className="text-muted-foreground mt-1">
                        Visualiza y mueve los tickets según su estado operativo actual.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    <Button asChild variant="outline">
                        <Link href="/dashboard/tickets/historial">
                            Ver Historial (Buscador)
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
                {COLUMNS.map((columnStatus) => (
                    <div key={columnStatus} className="flex flex-col bg-muted/30 rounded-xl p-4 gap-4 border border-border/50">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-semibold text-lg">{columnStatus}</h3>
                            <Badge variant="secondary" className="rounded-full">
                                {tickets.filter(t => t.status === columnStatus).length}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                            {tickets.filter(t => t.status === columnStatus).map(ticket => (
                                <Card 
                                    key={ticket.id} 
                                    onClick={() => setSelectedId(ticket.id)}
                                    className="cursor-pointer glass-card border-none hover:-translate-y-1 transition-all"
                                >
                                    <CardHeader className="p-4 pb-2 space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <Badge variant="outline" className={priorityColorMap[ticket.priority as TicketPriority]}>
                                                {ticket.priority}
                                            </Badge>
                                            <div className="flex items-center gap-1.5">
                                                <div 
                                                    title={getSlaStatus(ticket).label} 
                                                    className={`h-2 w-2 rounded-full ${getSlaStatus(ticket).color}`} 
                                                />
                                                <span className="text-xs text-muted-foreground font-medium">#{ticket.id.split('-')[1]}</span>
                                            </div>
                                        </div>
                                        <CardTitle className="text-sm font-semibold leading-tight">
                                            {ticket.subject}
                                        </CardTitle>
                                        <div className="flex flex-col pt-1">
                                            <span className="text-[11px] text-white font-medium">{getSubmitter(ticket.submitterId)?.name || 'Desconocido'}</span>
                                            <span className="text-[9px] text-primary uppercase font-bold tracking-wider">{getSubmitter(ticket.submitterId)?.empresa || 'Empresa externa'}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-3">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>{ticket.category}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{format(ticket.updatedAt, "MMM dd")}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {!loading && tickets.filter(t => t.status === columnStatus).length === 0 && (
                                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg p-6">
                                    <span className="text-sm text-muted-foreground">Sin requerimientos</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Sheet open={!!selectedId} onOpenChange={(val) => !val && setSelectedId(null)}>
                <SheetContent className="sm:max-w-md md:max-w-xl glass-panel border-l-primary/20">
                    {selectedId && <TicketDetailsInfo ticketId={selectedId} onUpdate={() => setRefreshCount(c => c + 1)} />}
                </SheetContent>
            </Sheet>
        </div>
    );
}
