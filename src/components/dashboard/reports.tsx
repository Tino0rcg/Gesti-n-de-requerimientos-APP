"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tickets } from "@/lib/data";
import { TicketPriority, TicketStatus } from "@/lib/definitions";

const statusCounts: Record<TicketStatus, number> = {
  Open: 0,
  "In Progress": 0,
  Resolved: 0,
  Closed: 0,
};

const priorityCounts: Record<TicketPriority, number> = {
  Low: 0,
  Medium: 0,
  High: 0,
  Critical: 0,
};

tickets.forEach(ticket => {
  statusCounts[ticket.status]++;
  priorityCounts[ticket.priority]++;
});

const statusData = Object.entries(statusCounts).map(([name, total]) => ({ name, total }));
const priorityData = Object.entries(priorityCounts).map(([name, total]) => ({ name, total }));


export function Reports() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Status</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={statusData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Priority</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={priorityData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
