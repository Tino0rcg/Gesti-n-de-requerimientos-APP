import { StatCards } from "@/components/dashboard/stat-cards";
import { TicketTable } from "@/components/dashboard/ticket-table";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTickets, getUsers } from "@/lib/data-server";

export default async function DashboardPage() {
  const tickets = await getTickets();
  const allUsers = await getUsers();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Overview Operativo</h1>
          <p className="text-zinc-500 font-medium text-sm">
            Control central de ANS (SLA) y rendimiento de la mesa de ayuda.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/dashboard/tickets/new">
            <Button className="bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Solicitud (SLA)
            </Button>
            </Link>
        </div>
      </div>

      <StatCards tickets={tickets} />

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="h-4 w-1 bg-primary rounded-full" />
            Análisis de Inteligencia de Negocios
        </h3>
        <AnalyticsCharts tickets={tickets} allUsers={allUsers} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                Flujo Reciente de Tickets
            </h3>
        </div>
        <TicketTable tickets={tickets} />
      </div>
    </div>
  );
}
