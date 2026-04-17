"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSlaStatus } from "@/lib/sla-utils";
import type { Ticket, User } from "@/lib/definitions";

export function AnalyticsCharts({ tickets, allUsers }: { tickets: Ticket[], allUsers: User[] }) {
  // 1. Tickets por Empresa
  const companyData = Object.entries(
    (tickets || []).reduce((acc, t) => {
      const user = allUsers?.find(u => u.id === t.submitterId);
      const empresa = user?.empresa || "Externo";
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))
   .sort((a, b) => b.value - a.value);

  // 2. Desempeño Técnico vs SLA por Servicio
  const tecnicos = (allUsers || []).filter(u => u.role === 'Agent');
  const techServiceSla = tecnicos.map(tec => {
    const techTickets = (tickets || []).filter(t => t.assigneeId === tec.id);
    const data: any = { name: tec.name.split(' ')[0] };
    
    ['Redes', 'Software', 'Hardware', 'Cuentas', 'Seguridad'].forEach(cat => {
      const catTickets = techTickets.filter(t => t.category === cat);
      const onTime = catTickets.filter(t => {
        if (!t.resolvedAt) return false;
        return t.resolvedAt <= t.dueAt;
      }).length;
      const total = catTickets.length;
      
      // % de cumplimiento por categoría
      data[cat] = total > 0 ? Math.round((onTime / total) * 100) : 0;
    });
    
    return data;
  });

  // 3. Distribución por Categoría de Servicio
  const serviceDistribution = Object.entries(
    (tickets || []).reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // 4. Análisis de SLA del Catálogo (Demora)
  // Nota: Esto podría venir de DB, pero por ahora usamos categorías fijas del gráfico 2 o una lista base
  const slaBase = [
      { name: 'Hardware (Crítica)', horas: 4 },
      { name: 'Redes (Alta)', horas: 12 },
      { name: 'Software (Media)', horas: 48 },
      { name: 'Accesos (Baja)', horas: 72 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
      {/* Gráfico 1: Tickets por Empresa */}
      <Card className="glass-card border-white/5 bg-black/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Demanda por Organización</CardTitle>
          <CardDescription>Volumen total de requerimientos por cliente</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={companyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 2: Desempeño Técnico vs SLA por Servicio */}
      <Card className="glass-card border-white/5 bg-black/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Puntualidad SLA por Categoría</CardTitle>
          <CardDescription>% de cumplimiento según el tipo de requerimiento</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={techServiceSla}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                cursor={{fill: 'transparent'}}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="Redes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Redes" />
              <Bar dataKey="Software" fill="#10b981" radius={[4, 4, 0, 0]} name="Software" />
              <Bar dataKey="Hardware" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Hardware" />
              <Bar dataKey="Cuentas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cuentas" />
              <Bar dataKey="Seguridad" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Seguridad" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 3: Distribución de Servicios */}
      <Card className="glass-card border-white/5 bg-black/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Incidencia por Categoría</CardTitle>
          <CardDescription>Servicios con mayor frecuencia de reporte</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 4: Análisis de Latencia SLA */}
      <Card className="glass-card border-white/5 bg-black/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Tiempos de Respuesta (Catálogo)</CardTitle>
          <CardDescription>Ranking de servicios por horas de SLA (Max a Min)</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slaBase} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="h" />
              <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
              />
              <Bar dataKey="horas" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
