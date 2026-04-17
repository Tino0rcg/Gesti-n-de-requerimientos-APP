"use client";

import { useState } from "react";
import { users as globalUsers, EMPRESAS_PERMITIDAS } from "@/lib/data";
import { User } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<User[]>(globalUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "User",
        empresa: "",
    });

    const handleAñadirUsuario = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `USR-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            role: formData.role as any,
            avatarUrl: '/avatars/3.png',
            empresa: formData.empresa,
        };
        // Persistir en el simulador global
        globalUsers.push(newUser);
        setUsuarios([...globalUsers]);
        setIsSheetOpen(false);
        setFormData({ name: "", email: "", role: "User", empresa: "" });
    };

    const filteredUsers = usuarios.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-1">
                        Control de acceso y roles para las diferentes cuentas.
                    </p>
                </div>
                <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </div>

            <Card className="glass-card border-none">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle>Directorio de Usuarios</CardTitle>
                            <CardDescription>Usuarios registrados con acceso a la plataforma.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por email o nombre..." 
                                className="pl-8 bg-black/20 border-white/10"
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
                                <TableHead>Usuario</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Empresa Asignada</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((usr) => (
                                <TableRow key={usr.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/20 text-primary">
                                                {usr.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm leading-none text-white">{usr.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{usr.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            usr.role === 'Manager' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                            usr.role === 'Agent' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                                            'bg-green-500/20 text-green-400 border-green-500/30'
                                        }>
                                            {usr.role.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-medium text-sm">{usr.empresa}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
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
                        <SheetTitle>Agregar Nuevo Usuario</SheetTitle>
                        <SheetDescription>
                            El usuario recibirá un correo con sus credenciales automáticas.
                        </SheetDescription>
                    </SheetHeader>
                    
                    <form onSubmit={handleAñadirUsuario} className="flex flex-col gap-6 mt-6 h-full">
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input required placeholder="Ej: Juan López" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black/20" />
                            </div>
                            <div className="space-y-2">
                                <Label>Correo Electrónico</Label>
                                <Input required type="email" placeholder="ejemplo@empresa.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-black/20" />
                            </div>
                            <div className="space-y-2">
                                <Label>Empresa Perteneciente</Label>
                                <Select required value={formData.empresa} onValueChange={(v) => setFormData({...formData, empresa: v})}>
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue placeholder="Debe pertenecer a una empresa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EMPRESAS_PERMITIDAS.map(emp => (
                                            <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Nivel de Permisos</Label>
                                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                                    <SelectTrigger className="bg-black/20">
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="User">Cliente Externo</SelectItem>
                                        <SelectItem value="Agent">Técnico / Soporte</SelectItem>
                                        <SelectItem value="Manager">Administrador Global</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <SheetFooter className="pb-8">
                            <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar Usuario</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
