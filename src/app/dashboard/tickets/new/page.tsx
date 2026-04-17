"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { ChevronLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewTicketPage() {
    const router = useRouter();
    const supabase = createClient();
    const [submitting, setSubmitting] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        subject: "",
        serviceId: "",
        description: "",
    });

    useEffect(() => {
        const loadServices = async () => {
            const { data } = await supabase.from('services').select('*');
            if (data) {
                setServices(data);
                if (data.length > 0) setFormData(prev => ({ ...prev, serviceId: data[0].id }));
            }
            setLoading(false);
        };
        loadServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const service = services.find(s => s.id === formData.serviceId);
            if (!service) throw new Error("Servicio no válido");

            const now = new Date();
            const dueAt = new Date(now.getTime() + service.sla_hours * 60 * 60 * 1000);

            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            // En un flujo real, el submitter_id vendría del Auth. 
            // Si no hay user (prototipo sin login real aún), usamos un hardcoded o el primer perfil.
            let submitterId = userId;
            if (!submitterId) {
                const { data: firstProfile } = await supabase.from('profiles').select('id').limit(1).single();
                submitterId = firstProfile?.id;
            }

            const { error } = await supabase.from('tickets').insert({
                subject: formData.subject,
                description: formData.description,
                status: 'Ingresado',
                priority: service.priority,
                category: service.category,
                service_id: service.id,
                submitter_id: submitterId,
                due_at: dueAt.toISOString(),
                created_at: now.toISOString(),
                updated_at: now.toISOString()
            });

            if (error) throw error;

            // Enviar notificación (Mock API)
            await sendTicketNotification(formData.subject, "Nuevo requerimiento ingresado al sistema.");

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            console.error("Error al crear ticket:", error);
            setSubmitting(false);
        }
    };

    const currentService = services.find(s => s.id === formData.serviceId);

    if (loading) return <div className="p-8 text-center text-zinc-500 italic">Cargando catálogo de servicios...</div>;

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="h-9 w-9 glass-card border-white/10">
                    <Link href="/dashboard">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic">Nuevo Requerimiento</h1>
                    <p className="text-zinc-500 text-xs sm:text-sm font-medium">Completa los datos técnicos para ingresar una nueva solicitud bajo SLA.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="glass-card border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Configuración del Ticket
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            El SLA de resolución será asignado automáticamente basado en el catálogo de servicios de su contrato.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-zinc-300 font-bold">Asunto principal <span className="text-primary italic">*</span></Label>
                            <Input 
                                id="subject" 
                                required 
                                placeholder="Ej: Falla en servidor principal, Pantalla azul..." 
                                className="bg-black/40 border-white/10 text-white focus:border-primary/50 transition-all h-11"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-bold">Servicio Afectado (Catálogo Contractual)</Label>
                            <Select value={formData.serviceId} onValueChange={(v) => setFormData({...formData, serviceId: v})}>
                                <SelectTrigger className="bg-black/40 border-white/10 text-white h-11">
                                    <SelectValue placeholder="Selecciona el servicio afectado..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    {services.map(svc => (
                                        <SelectItem key={svc.id} value={svc.id}>
                                            {svc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {currentService && (
                                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-primary">Compromiso SLA Nivel {currentService.priority}</span>
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <Clock className="h-4 w-4 text-primary" />
                                            {currentService.sla_hours} Horas Máximo
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                                        Este requerimiento se categoriza como <span className="text-white font-bold">{currentService.category}</span>. 
                                        El tiempo de respuesta se rige bajo la cláusula técnica de criticidad {currentService.priority}.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-zinc-300 font-bold">Descripción Detallada <span className="text-primary italic">*</span></Label>
                            <Textarea 
                                id="description" 
                                required 
                                placeholder="Describe el problema, pasos para reproducirlo, equipo afectado, etc..." 
                                className="min-h-[150px] bg-black/40 border-white/10 text-white focus:border-primary/50 transition-all resize-none p-4"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between border-t border-white/5 pt-6 bg-white/5">
                        <Button variant="ghost" asChild className="w-full sm:w-auto text-zinc-400 hover:text-white hover:bg-white/5">
                            <Link href="/dashboard">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={submitting} className="w-full sm:min-w-[180px] bg-primary hover:bg-primary/90 text-black font-black uppercase italic tracking-tighter shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                            {submitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Procesando...
                                </div>
                            ) : (
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
