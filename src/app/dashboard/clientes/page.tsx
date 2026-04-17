"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
    Building2, 
    MoreHorizontal, 
    PlusCircle, 
    Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientesPage() {
    const supabase = createClient();
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nombre: "",
        rut: "",
        plan: "Pro",
        status: "Activo",
    });

    useEffect(() => {
        const loadCompanies = async () => {
            const { data } = await supabase.from('companies').select('*');
            if (data) setEmpresas(data);
            setLoading(false);
        };
        loadCompanies();
    }, []);

    const handleNuevaEmpresa = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { error } = await supabase.from('companies').insert({
            name: formData.nombre,
            rut: formData.rut,
            plan: formData.plan,
            status: formData.status
        });

        if (!error) {
            const { data } = await supabase.from('companies').select('*');
            if (data) setEmpresas(data);
            setIsSheetOpen(false);
            setFormData({ nombre: "", rut: "", plan: "Pro", status: "Activo" });
        }
    };

    const filteredEmpresas = (empresas || []).filter(emp => 
        (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.rut || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-zinc-500 italic">Conectando con el registro corporativo...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Clientes y Empresas</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona las organizaciones y sus privilegios de acceso.
                    </p>
                </div>
                <Button onClick={() => setIsSheetOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
                    <PlusCircle className="h-4 w-4" />
                    Nueva Empresa
                </Button>
            </div>

            <Card className="glass-card border-white/5">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-white">Listado de Empresas</CardTitle>
                            <CardDescription>Empresas habilitadas para utilizar la plataforma.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar empresa o RUT..." 
                                className="pl-8 bg-black/20 border-white/10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="text-zinc-400">Nombre de Empresa</TableHead>
                                <TableHead className="text-zinc-400">RUT / ID</TableHead>
                                <TableHead className="text-zinc-400">Plan</TableHead>
                                <TableHead className="text-zinc-400">Usuarios</TableHead>
                                <TableHead className="text-zinc-400">Estado</TableHead>
                                <TableHead className="text-right text-zinc-400">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmpresas.map((empresa) => (
                                <TableRow key={empresa.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-medium flex items-center gap-3 py-4 text-zinc-100">
                                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        {empresa.name}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 font-mono text-xs">{empresa.rut}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-300">
                                            {empresa.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-300">0 activos</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            empresa.status === 'Activo' ? 'bg-green-500/20 text-green-400 border-green-500/20' : ''
                                        }>
                                            {empresa.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="glass-panel border-l-primary/20">
                    <SheetHeader>
                        <SheetTitle>Registrar Empresa</SheetTitle>
                        <SheetDescription>
                            Al registrar una empresa, se habilita automáticamente el acceso para sus colaboradores.
                        </SheetDescription>
                    </SheetHeader>
                    
                    <form onSubmit={handleNuevaEmpresa} className="flex flex-col gap-6 mt-6 h-full">
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <Label>Nombre de la Organización</Label>
                                <Input 
                                    required 
                                    placeholder="Ej: Corporación Delta S.A." 
                                    value={formData.nombre} 
                                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                    className="bg-black/20 border-white/10" 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>RUT / Identificador Fiscal</Label>
                                <Input 
                                    required 
                                    placeholder="76.xxx.xxx-x" 
                                    value={formData.rut} 
                                    onChange={e => setFormData({...formData, rut: e.target.value})} 
                                    className="bg-black/20 border-white/10" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Plan de Servicio</Label>
                                <Select value={formData.plan} onValueChange={(v) => setFormData({...formData, plan: v})}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Seleccionar plan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Básico">Plan Básico</SelectItem>
                                        <SelectItem value="Pro">Plan Pro (Estándar)</SelectItem>
                                        <SelectItem value="Premium">Plan Premium (Full SLA)</SelectItem>
                                        <SelectItem value="Corporativo">Plan Corporativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Estado Inicial</Label>
                                <Select value={formData.estado} onValueChange={(v) => setFormData({...formData, estado: v})}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Estado..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo (Habilitado)</SelectItem>
                                        <SelectItem value="Inactivo">Inactivo (Suspendido)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <SheetFooter className="pb-8">
                            <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">Habilitar Empresa</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
