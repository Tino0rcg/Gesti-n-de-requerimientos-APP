import { TicketTable } from "@/components/dashboard/ticket-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HistorialTicketsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/tickets">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Historial de Tickets</h1>
                    <p className="text-muted-foreground mt-1">
                        Búsqueda avanzada y registro histórico de todos los requerimientos.
                    </p>
                </div>
            </div>

            <TicketTable filterStatus="Terminado" />
        </div>
    );
}
