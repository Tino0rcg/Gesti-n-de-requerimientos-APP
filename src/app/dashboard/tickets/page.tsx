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
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const COLUMNS: TicketStatus[] = ['Ingresado', 'En proceso', 'Espera de aprobación', 'Terminado'];

const priorityColorMap: { [key in TicketPriority]: string } = {
    Baja: "bg-green-500/20 text-green-400 border border-green-500/30",
    Media: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Alta: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    Crítica: "bg-red-500/20 text-red-400 border border-red-500/30",
};

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function TicketCard({ ticket, submitter, onClick }: { ticket: Ticket, submitter?: User, onClick: () => void }) {
    return (
        <Card 
            onClick={onClick}
            className="cursor-pointer glass-card border-none hover:-translate-y-1 transition-all shadow-md"
        >
            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <Badge variant="outline" className={priorityColorMap[ticket.priority as TicketPriority]}>
                        {ticket.priority}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                        <div 
                            title={getSlaStatus(ticket).label} 
                            className={`h-2.5 w-2.5 rounded-full ${getSlaStatus(ticket).color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} 
                        />
                        <span className="text-xs text-muted-foreground font-mono">#{ticket.id.split('-')[1]}</span>
                    </div>
                </div>
                <CardTitle className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                    {ticket.subject}
                </CardTitle>
                <div className="flex flex-col pt-1">
                    <span className="text-[11px] text-white/90 font-medium">{submitter?.name || 'Desconocido'}</span>
                    <span className="text-[9px] text-primary uppercase font-black tracking-widest opacity-80">{submitter?.empresa || 'Empresa externa'}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 mb-3 leading-relaxed">
                    {ticket.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-zinc-600" />
                        <span>{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-zinc-600" />
                        <span>{format(ticket.updatedAt, "MMM dd")}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function KanbanTicketsPage() {
    const supabase = createClient();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [profiles, setProfiles] = useState<User[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0);

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
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
            const { data: profilesData } = await supabase.from('profiles').select('*');
            if (profilesData) setProfiles(profilesData as User[]);
        } catch (err) {
            console.error("Error fetching Kanban data:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshCount]);

    const handleUpdate = React.useCallback(() => {
        setRefreshCount(c => c + 1);
    }, []);

    const getSubmitter = (id: string) => profiles.find(u => u.id === id);

    return (
        <div className="flex flex-col gap-6 h-full pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tablero de Requerimientos</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Visualiza y mueve los tickets según su estado operativo actual.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <Link href="/dashboard/tickets/historial">
                            Ver Historial
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Desktop View: Grid Layout */}
            <div className="hidden lg:grid grid-cols-4 gap-4 h-full">
                {COLUMNS.map((columnStatus) => (
                    <div key={columnStatus} className="flex flex-col bg-muted/30 rounded-xl p-4 gap-4 border border-border/50">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-semibold text-base">{columnStatus}</h3>
                            <Badge variant="secondary" className="rounded-full">
                                {tickets.filter(t => t.status === columnStatus).length}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[500px]">
                            {tickets.filter(t => t.status === columnStatus).map(ticket => (
                                <TicketCard 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    submitter={getSubmitter(ticket.submitterId)} 
                                    onClick={() => setSelectedId(ticket.id)} 
                                />
                            ))}
                            {!loading && tickets.filter(t => t.status === columnStatus).length === 0 && (
                                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg p-6">
                                    <span className="text-xs text-muted-foreground text-center">Sin requerimientos en este estado</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile/Tablet View: Tabs Layout */}
            <div className="lg:hidden flex flex-col h-full">
                <Tabs defaultValue="Ingresado" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-muted/50 p-1 mb-4">
                        {COLUMNS.map(col => (
                            <TabsTrigger key={col} value={col} className="text-[10px] sm:text-xs">
                                {col} ({tickets.filter(t => t.status === col).length})
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {COLUMNS.map(col => (
                        <TabsContent key={col} value={col} className="mt-0 space-y-3">
                             {tickets.filter(t => t.status === col).map(ticket => (
                                <TicketCard 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    submitter={getSubmitter(ticket.submitterId)} 
                                    onClick={() => setSelectedId(ticket.id)} 
                                />
                            ))}
                            {!loading && tickets.filter(t => t.status === col).length === 0 && (
                                <div className="flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg p-10">
                                    <span className="text-sm text-muted-foreground">Sin requerimientos</span>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <Sheet open={!!selectedId} onOpenChange={(val) => !val && setSelectedId(null)}>
                <SheetContent className="sm:max-w-md md:max-w-xl glass-panel border-l-primary/20">
                    {selectedId && <TicketDetailsInfo ticketId={selectedId} onUpdate={handleUpdate} />}
                </SheetContent>
            </Sheet>
        </div>
    );
}
