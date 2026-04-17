"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, PlusCircle, Search, Wrench, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TecnicosPage() {
    const supabase = createClient();
    const [tecnicos, setTecnicos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        nombre: "",
        especialidad: "Soporte Nivel 1",
        estado: "Disponible",
        password: "",
    });

    useEffect(() => {
        const loadTechs = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'Agent');
            if (data) setTecnicos(data);
            setLoading(false);
        };
        loadTechs();
    }, []);

    const handleAñadirTecnico = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { error } = await supabase.from('profiles').insert({
            name: formData.nombre,
            role: 'Agent',
            specialty: formData.especialidad,
            status: formData.estado,
            rating: 5.0,
            avatar_url: '/avatars/3.png'
        });

        if (!error) {
            const { data } = await supabase.from('profiles').select('*').eq('role', 'Agent');
            if (data) setTecnicos(data);
            setIsSheetOpen(false);
            setFormData({ nombre: "", especialidad: "Soporte Nivel 1", estado: "Disponible", password: "" });
        }
    };

    const filteredTecnicos = (tecnicos || []).filter(t => 
        (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.specialty || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-zinc-500 italic">Cargando agentes especializados...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Técnicos y Especialistas</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra el equipo de soporte interno y su volumen de trabajo.
                    </p>
                </div>
                <Button onClick={() => setIsSheetOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusCircle className="h-4 w-4" />
                    Nuevo Técnico
                </Button>
            </div>

            <Card className="glass-card border-none">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle>Equipo de Resolución</CardTitle>
                            <CardDescription>Técnicos operativos dentro del sistema Vanguardia.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar especialista..." 
                                className="pl-8 bg-black/20 border-white/10 text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead>Técnico</TableHead>
                                <TableHead>Especialidad</TableHead>
                                <TableHead>Carga Actual (Tickets)</TableHead>
                                <TableHead>Calificación CSAT</TableHead>
                                <TableHead>Disponibilidad</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTecnicos.map((tec) => (
                                <TableRow key={tec.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-white/10">
                                            <AvatarFallback className="bg-blue-500/20 text-blue-400">
                                                {(tec.name || "U").charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-white leading-none">{tec.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{tec.id}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Wrench className="h-3 w-3 "/>
                                            <span>{tec.specialty || "General"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                                            0 asignados
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-yellow-500">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="text-sm font-bold text-white">{Number(tec.rating || 5).toFixed(1)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            tec.status === 'Disponible' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                            tec.status === 'En Terreno' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                                            'bg-red-500/20 text-red-400 border-red-500/30'
                                        }>
                                            {tec.status || 'Disponible'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="hover:text-white">
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal Deslizable para Nuevo Técnico */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="glass-panel border-l-primary/20">
                    <SheetHeader>
                        <SheetTitle>Inscribir Nuevo Técnico</SheetTitle>
                        <SheetDescription>
                            El nuevo agente comenzará con 0 carga laboral y calificación perfecta (5.0).
                        </SheetDescription>
                    </SheetHeader>
                    
                    <form onSubmit={handleAñadirTecnico} className="flex flex-col gap-6 mt-6 h-full">
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <Label>Nombre de Técnico</Label>
                                <Input required placeholder="Ej: Luis Valenzuela" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="bg-black/20" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contraseña de Acceso</Label>
                                <Input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-black/20" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Especialidad Principal</Label>
                                <Select value={formData.especialidad} onValueChange={(v) => setFormData({...formData, especialidad: v})}>
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue placeholder="Seleccionar rubro..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Soporte Nivel 1">Soporte Nivel 1</SelectItem>
                                        <SelectItem value="Soporte Nivel 2">Soporte Nivel 2</SelectItem>
                                        <SelectItem value="Infraestructura">Infraestructura Fija</SelectItem>
                                        <SelectItem value="Redes y Servidores">Redes y Servidores</SelectItem>
                                        <SelectItem value="Analísta de Ciberseguridad">Especialista Seguridad</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Estado Inicial</Label>
                                <Select value={formData.estado} onValueChange={(v) => setFormData({...formData, estado: v})}>
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue placeholder="Estado..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Disponible">Disponible para oficina</SelectItem>
                                        <SelectItem value="En Terreno">Operando en Terreno</SelectItem>
                                        <SelectItem value="Fuera de turno">Fuera de turno (No asignar)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <SheetFooter className="pb-8">
                            <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Incorporar Técnico</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
