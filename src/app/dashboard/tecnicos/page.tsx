"use client";

import { useState } from "react";
import { tecnicos as globalTecnicos } from "@/lib/data";
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
    const [tecnicos, setTecnicos] = useState(globalTecnicos);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        nombre: "",
        especialidad: "Soporte Nivel 1",
        estado: "Disponible",
    });

    const handleAñadirTecnico = (e: React.FormEvent) => {
        e.preventDefault();
        const newTecnico = {
            id: `TEC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            nombre: formData.nombre,
            especialidad: formData.especialidad,
            ticketsActivos: 0,
            estado: formData.estado,
            rating: 5.0, // rating base
        };
        globalTecnicos.push(newTecnico);
        setTecnicos([...globalTecnicos]);
        setIsSheetOpen(false);
        setFormData({ nombre: "", especialidad: "Soporte Nivel 1", estado: "Disponible" });
    };

    const filteredTecnicos = tecnicos.filter(t => 
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                                {tec.nombre.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-white leading-none">{tec.nombre}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{tec.id}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Wrench className="h-3 w-3 "/>
                                            <span>{tec.especialidad}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={tec.ticketsActivos > 3 ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-zinc-800 text-zinc-300 border-zinc-700"}>
                                            {tec.ticketsActivos} asignados
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-yellow-500">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="text-sm font-bold text-white">{Number(tec.rating).toFixed(1)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            tec.estado === 'Disponible' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                            tec.estado === 'En Terreno' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                                            'bg-red-500/20 text-red-400 border-red-500/30'
                                        }>
                                            {tec.estado}
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
