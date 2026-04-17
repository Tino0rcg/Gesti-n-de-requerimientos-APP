"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { login } from "./actions";

function errorToSpanish(message: string): string {
    if (message.includes("Invalid login credentials")) {
        return "El correo o la contraseña son incorrectos.";
    }
    if (message.includes("Email not confirmed")) {
        return "Por favor confirma tu correo electrónico antes de ingresar.";
    }
    if (message.includes("FetchError")) {
         return "Fallo de conexión a la base de datos.";
    }
    return "Ha ocurrido un error inesperado al intentar iniciar sesión.";
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        const result = await login(formData);
        
        if (result?.error) {
            setErrorMsg(errorToSpanish(result.error));
            setLoading(false);
        }
        // Si hay éxito, el servidor hará redirect a /dashboard
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Gestor de Requerimientos</CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales para acceder a la plataforma
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {errorMsg && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {errorMsg}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="tucorreo@empresa.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                            </div>
                            <Input 
                                id="password" 
                                type="password" 
                                required 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Autenticando..." : "Iniciar Sesión"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
