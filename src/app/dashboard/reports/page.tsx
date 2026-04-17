import { Reports } from "@/components/dashboard/reports";
import { StatCards } from "@/components/dashboard/stat-cards";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          An overview of your IT support metrics.
        </p>
      </div>
      <StatCards />
      <Reports />
    </div>
  );
}
