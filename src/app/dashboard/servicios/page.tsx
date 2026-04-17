"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    BriefcaseBusiness, 
    Clock, 
    MoreVertical, 
    PlusCircle, 
    Server, 
    ShieldCheck, 
    Wifi, 
    Settings,
    HardDrive,
    Lock
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iconMap: Record<string, any> = {
    Hardware: <HardDrive className="h-5 w-5" />,
    Redes: <Wifi className="h-5 w-5" />,
    Software: <Settings className="h-5 w-5" />,
    Accesos: <Lock className="h-5 w-5" />,
    Otro: <BriefcaseBusiness className="h-5 w-5" />,
};

export default function ServiciosPage() {
    const supabase = createClient();
    const [catalog, setCatalog] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        nombre: "",
        category: "Software",
        slaHours: "48",
    });

    useEffect(() => {
        const loadServices = async () => {
            const { data } = await supabase.from('services').select('*');
            if (data) setCatalog(data);
            setLoading(false);
        };
        loadServices();
    }, []);

    const handleAñadirServicio = async (e: React.FormEvent) => {
        e.preventDefault();
        const priorityMap: Record<string, string> = {
            "4": "Crítica",
            "12": "Alta",
            "48": "Media",
            "72": "Baja"
        };

        const { error } = await supabase.from('services').insert({
            id: `SRV-${Math.floor(Math.random() * 1000)}`,
            name: formData.nombre,
            category: formData.category,
            priority: priorityMap[formData.slaHours] || "Media",
            sla_hours: parseInt(formData.slaHours),
        });

        if (!error) {
            const { data } = await supabase.from('services').select('*');
            if (data) setCatalog(data);
            setIsSheetOpen(false);
            setFormData({ nombre: "", category: "Software", slaHours: "48" });
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500 italic">Cargando catálogo maestro de ANS...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Catálogo de Servicios</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Define los entregables contractuales y sus tiempos de respuesta (SLA).
                    </p>
                </div>
                <Button onClick={() => setIsSheetOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-black font-bold">
                    <PlusCircle className="h-4 w-4" />
                    Nuevo Servicio
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {catalog.map((srv) => (
                    <Card key={srv.id} className="glass-card border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all bg-black/20">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                    {iconMap[srv.category] || <BriefcaseBusiness className="h-5 w-5" />}
                                </div>
                                <Badge variant="outline" className={
                                    srv.priority === 'Crítica' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    srv.priority === 'Alta' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }>
                                    {srv.priority}
                                </Badge>
                            </div>
                            <CardTitle className="mt-4 text-lg font-bold text-white leading-tight uppercase tracking-tight">{srv.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1.5 mt-2 font-medium text-primary">
                                <Clock className="h-3.5 w-3.5" />
                                SLA: {srv.sla_hours} Horas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Categoría Técnica</span>
                                    <span className="text-white font-semibold">{srv.category}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">ID de Servicio</span>
                                    <span className="font-mono text-zinc-500">{srv.id}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="glass-panel border-l-primary/20">
                    <SheetHeader>
                        <SheetTitle>Crear Nuevo Servicio</SheetTitle>
                        <SheetDescription>
                            Define un nuevo entregable para tus clientes. El sistema aplicará este SLA automáticamente.
                        </SheetDescription>
                    </SheetHeader>
                    
                    <form onSubmit={handleAñadirServicio} className="flex flex-col gap-6 mt-6 h-full">
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <Label>Nombre del Servicio / Ítem</Label>
                                <Input 
                                    required 
                                    placeholder="Ej: Mantenimiento Preventivo Mensual" 
                                    value={formData.nombre} 
                                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                    className="bg-black/20 border-white/10" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Categoría Técnica</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Categoría..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hardware">Hardware e Infraestructura</SelectItem>
                                        <SelectItem value="Software">Software y Aplicaciones</SelectItem>
                                        <SelectItem value="Redes">Telecomunicaciones y Redes</SelectItem>
                                        <SelectItem value="Accesos">Accesos y Ciberseguridad</SelectItem>
                                        <SelectItem value="Otro">Soporte General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>TLA / SLA Objetivo</Label>
                                <Select value={formData.slaHours} onValueChange={(v) => setFormData({...formData, slaHours: v})}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="SLA..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4">4 Horas (Crítico / Emergencia)</SelectItem>
                                        <SelectItem value="12">12 Horas (Alta Prioridad)</SelectItem>
                                        <SelectItem value="48">48 Horas (Planificado / Media)</SelectItem>
                                        <SelectItem value="72">72 Horas (Bajo impacto)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground mt-2 italic">
                                    Nota: La prioridad (Crítica, Alta, etc.) se infiere según las horas de SLA seleccionadas.
                                </p>
                            </div>
                        </div>

                        <SheetFooter className="pb-8">
                            <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">Registrar en Catálogo</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
