import { LineChart, BarChart, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardsPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Paneles de Control (Dashboards)</h1>
            <p className="text-muted-foreground">
                Visualiza las métricas clave del sistema.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dashboard 1</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Resumen General</div>
                        <p className="text-xs text-muted-foreground mt-1">Estadísticas por definir</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dashboard 2</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Métricas de Clientes</div>
                        <p className="text-xs text-muted-foreground mt-1">Estadísticas por definir</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dashboard 3</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rendimiento de Técnicos</div>
                        <p className="text-xs text-muted-foreground mt-1">Estadísticas por definir</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
