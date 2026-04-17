"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tickets, notes as initialNotes, getLeastBusyTech, SERVICE_CATALOG } from "@/lib/data";
import { Ticket } from "@/lib/definitions";
import { sendTicketNotification } from "@/app/actions/notifications";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";



export default function NewTicketPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        subject: "",
        serviceId: "falla_software",
        description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Simular latencia de red
        setTimeout(() => {
            const now = new Date();
            const service = SERVICE_CATALOG.find(s => s.id === formData.serviceId)!;

            // Calcular SLA Date basado en prioridad inferida por el servicio seleccionado
            let hoursUntilDue = service.slaHours;
            
            const dueAt = new Date(now.getTime() + hoursUntilDue * 60 * 60 * 1000);
            
            // Auto-asignación inteligente
            const autoTech = getLeastBusyTech();

            // Construir ticket
            const newTicket: Ticket = {
                id: `REQ-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                subject: formData.subject,
                description: formData.description,
                status: 'Ingresado',
                priority: service.priority as any,
                submitterId: 'USR-4', // Claudio Garrido (TechNova)
                assigneeId: autoTech.id, // Asignado automáticamente
                category: service.category as any,
                createdAt: now,
                updatedAt: now,
                dueAt: dueAt,
            };

            // Escribir en la memoria local (mock base de datos)
            tickets.unshift(newTicket);

            // Enviar notificación de asignación inicial
            sendTicketNotification(newTicket.id, `¡Ticket creado! Su técnico asignado es ${autoTech.nombre}.`);

            // Redirigir al inicio
            router.push('/dashboard/tickets');
            router.refresh(); // Forzar recompilación visual en servidor
        }, 800);
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="h-9 w-9">
                    <Link href="/dashboard/tickets">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nuevo Requerimiento</h1>
                    <p className="text-muted-foreground mt-1">Completa los datos técnicos para ingresar una nueva solicitud.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="glass-card border-white/10">
                    <CardHeader>
                        <CardTitle>Información del Ticket</CardTitle>
                        <CardDescription>
                            El SLA de resolución será asignado automáticamente basado en el catálogo de servicios de su contrato.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Asunto principal <span className="text-red-500">*</span></Label>
                            <Input 
                                id="subject" 
                                required 
                                placeholder="Ej: Falla en servidor principal, Pantalla azul..." 
                                className="bg-black/20"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Servicio Afectado (Catálogo Contractual)</Label>
                            <Select value={formData.serviceId} onValueChange={(v) => setFormData({...formData, serviceId: v})}>
                                <SelectTrigger className="bg-black/20">
                                    <SelectValue placeholder="Selecciona el servicio afectado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SERVICE_CATALOG.map(svc => (
                                        <SelectItem key={svc.id} value={svc.id}>
                                            {svc.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md">
                                <span className="text-primary font-semibold">TLA Estricto:</span> 
                                Resolución de "{SERVICE_CATALOG.find(s => s.id === formData.serviceId)?.nombre}" 
                                se establece como 
                                <span className="font-bold underline text-white ml-0.5">
                                    {SERVICE_CATALOG.find(s => s.id === formData.serviceId)?.priority}
                                </span> con un plazo legal exigible de máximo 
                                <span className="font-black text-primary text-sm tracking-wide ml-0.5">
                                    {SERVICE_CATALOG.find(s => s.id === formData.serviceId)?.slaHours} hrs
                                </span>.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción Detallada <span className="text-red-500">*</span></Label>
                            <Textarea 
                                id="description" 
                                required 
                                placeholder="Describe el problema, pasos para reproducirlo, equipo afectado, etc..." 
                                className="min-h-[150px] bg-black/20 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-white/5 pt-6">
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard/tickets">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={submitting} className="min-w-[150px]">
                            {submitting ? 'Guardando...' : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Ingresar Ticket
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
