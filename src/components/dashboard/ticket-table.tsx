"use client";

import * as React from "react";
import {
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from 'date-fns';
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TicketDetailsInfo } from "@/components/dashboard/ticket-details-info";
import { getSlaStatus } from "@/lib/sla-utils";

import { tickets, users } from "@/lib/data";
import type { Ticket, User, TicketStatus, TicketPriority } from "@/lib/definitions";

const getAssignee = (assigneeId: string | null): User | undefined => users.find(u => u.id === assigneeId);
const getSubmitter = (submitterId: string): User | undefined => users.find(u => u.id === submitterId);

const statusVariant: { [key in TicketStatus]: "default" | "secondary" | "destructive" | "outline" } = {
    'Ingresado': "default",
    'En proceso': "secondary",
    'Espera de aprobación': "outline",
    'Terminado': "outline",
}

const statusColorMap: { [key in TicketStatus]: string } = {
    'Ingresado': "bg-blue-500/10 text-blue-400 border-blue-500/20",
    'En proceso': "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    'Espera de aprobación': "bg-purple-500/10 text-purple-400 border-purple-500/20",
    'Terminado': "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
}

const priorityColorMap: { [key in string]: string } = {
    Baja: "bg-green-500/20 text-green-400 border border-green-500/30",
    Media: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Alta: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    Crítica: "bg-red-500/20 text-red-400 border border-red-500/30",
}

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "id",
    header: "Ticket ID",
    cell: ({ row }) => <Link href={`/dashboard/tickets`} className="hover:underline font-mono text-xs">{row.getValue("id")}</Link>,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subject
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize font-medium">{row.getValue("subject")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as TicketStatus;
        const ticket = row.original;
        const sla = getSlaStatus(ticket);
        return (
            <div className="flex items-center gap-2">
                <div title={sla.label} className={`h-2.5 w-2.5 rounded-full ${sla.color}`} />
                <Badge variant={statusVariant[status]}>{status}</Badge>
            </div>
        )
    },
  },
  {
    accessorKey: "submitterId",
    header: "Solicitante / Empresa",
    cell: ({ row }) => {
        const submitter = getSubmitter(row.getValue("submitterId"));
        if (!submitter) return <span className="text-muted-foreground italic text-xs">Externo</span>;

        return (
            <div className="flex flex-col">
                <span className="font-bold text-white text-sm leading-tight mb-0.5">{submitter.name}</span>
                <span className="text-[10px] text-blue-400 uppercase font-black tracking-wider opacity-90">{submitter.empresa}</span>
            </div>
        )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
        const priority = row.getValue("priority") as TicketPriority;
        return <Badge variant="outline" className={priorityColorMap[priority]}>{priority}</Badge>
    },
  },
  {
    accessorKey: "assigneeId",
    header: "Assignee",
    cell: ({ row }) => {
        const assignee = getAssignee(row.getValue("assigneeId"));
        if (!assignee) return <span className="text-muted-foreground">Unassigned</span>;

        return (
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-white/10">
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[10px]">
                        {assignee.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm">{assignee.name}</span>
            </div>
        )
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Updated
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => <div className="text-xs text-muted-foreground">{format(row.getValue("updatedAt"), "PPp")}</div>,
  },
];

export function TicketTable({ filterStatus }: { filterStatus?: TicketStatus }) {
  const [data] = React.useState(() => {
      let result = [...tickets];
      if (filterStatus) {
          result = result.filter(t => t.status === filterStatus);
      }
      return result;
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
        pagination: {
            pageSize: 5,
        }
    }
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter tickets by subject..."
          value={(table.getColumn("subject")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("subject")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-black/20 border-white/10"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto border-white/10 bg-black/20">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-zinc-400 focus:text-white"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden text-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-zinc-400 font-bold py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => setSelectedId(row.original.id)}
                  className="cursor-pointer hover:bg-white/5 transition-all border-white/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-zinc-500 font-medium">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-white/10 bg-black/20 h-8"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-white/10 bg-black/20 h-8"
          >
            Next
          </Button>
        </div>
      </div>
      <Sheet open={!!selectedId} onOpenChange={(val) => !val && setSelectedId(null)}>
        <SheetContent className="sm:max-w-md md:max-w-xl glass-panel border-l-primary/20 p-0 overflow-y-auto">
          {selectedId && <TicketDetailsInfo ticketId={selectedId} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
