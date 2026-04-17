import Link from "next/link";
import {
    Building2,
    Home,
    LineChart,
    PieChart,
    BarChart,
    PanelLeft,
    PlusCircle,
    Search,
    Settings,
    Ticket,
    Users,
    Wrench,
    Archive,
    BriefcaseBusiness,
} from "lucide-react";
import Image from "next/image";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { NavLinks } from "@/components/dashboard/nav-links";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r border-white/10 glass-panel sm:flex">
                <div className="flex px-6 py-6 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <Ticket className="h-6 w-6" />
                    </div>
                    <span className="font-heading font-bold text-xl tracking-tight">ServiDesk</span>
                </div>
                
                <nav className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 mt-4 pb-4 custom-scrollbar">
                    {/* Botón para crear requerimiento */}
                    <Link
                        href="/dashboard/tickets/new"
                        className="flex items-center justify-center gap-3 rounded-lg bg-primary text-primary-foreground px-3 py-2.5 transition-colors hover:bg-primary/90 font-bold mb-4 shadow-lg shadow-primary/20"
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span>Nuevo Ticket</span>
                    </Link>

                    <NavLinks />
                </nav>

                <nav className="mt-auto px-4 pb-6">
                    <Link
                        href="#"
                        className="flex items-center gap-3 rounded-lg text-muted-foreground px-3 py-2.5 transition-all hover:bg-white/5 hover:text-foreground"
                    >
                        <Settings className="h-5 w-5" />
                        <span>Configuración</span>
                    </Link>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 glass-panel px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="sm:hidden">
                                <PanelLeft className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs">
                            <nav className="grid gap-6 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                                >
                                    <Ticket className="h-5 w-5 transition-all group-hover:scale-110" />
                                    <span className="sr-only">GestorRequerimientos</span>
                                </Link>
                                <Link
                                    href="/dashboard/tickets/new"
                                    className="flex items-center gap-4 px-2.5 text-primary"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                    Nuevo Requerimiento
                                </Link>
                                <div className="flex flex-col gap-2 mt-4">
                                    <NavLinks />
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="relative ml-auto flex-1 md:grow-0">
                        <Logo />
                    </div>
                    <div className="relative ml-auto flex-1 md:grow-0">
                    </div>
                    <UserNav />
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
