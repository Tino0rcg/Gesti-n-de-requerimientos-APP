import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Cpu, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-primary/30 selection:text-primary">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-50 flex items-center justify-between px-6 py-8 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Image 
            src="https://github.com/Tino0rcg/imagenes-pagina-online-2.0/blob/main/LOGO%20ONLINE%20SYSTEM%20NORMAL.png?raw=true" 
            alt="Online System Logo" 
            width={50} 
            height={50}
            className="object-contain"
          />
          <span className="text-2xl font-black tracking-tighter uppercase italic">Online System</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs">
            Acceso Clientes
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-bounce">
          <Zap className="w-3 h-3" />
          Plataforma de Nueva Generación
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 italic uppercase">
          Gestión de <span className="text-primary italic">Requerimientos</span> <br /> 
          <span className="text-zinc-500">con Inteligencia Operativa.</span>
        </h1>
        
        <p className="max-w-2xl mb-12 text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">
          Optimice la resolución de incidentes, controle sus SLAs y mantenga la trazabilidad total 
          de sus activos digitales con la plataforma líder de Online System.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-primary hover:bg-primary/90 text-black font-black uppercase italic tracking-tighter text-lg shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95">
              Iniciar Sesión <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-8 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col items-start">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Soporte</span>
              <span className="text-sm font-bold">24/7 Realtime</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">SLA</span>
              <span className="text-sm font-bold">99.9% Success</span>
            </div>
          </div>
        </div>

        {/* Floating Icons Background Decor */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-20 opacity-10 hidden xl:block">
          <Cpu className="w-64 h-64 text-primary" />
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-32 opacity-10 hidden xl:block">
          <ShieldCheck className="w-64 h-64 text-blue-500" />
        </div>
      </main>

      {/* Footer / Features snippet */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-3xl py-12 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="text-primary font-bold uppercase tracking-widest text-xs">01. Trazabilidad</h3>
            <p className="text-zinc-500 text-sm">Bitácora completa de cada requerimiento con reportes PDF automáticos.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-primary font-bold uppercase tracking-widest text-xs">02. Control ANS</h3>
            <p className="text-zinc-500 text-sm">Monitoreo en tiempo real de Acuerdos de Nivel de Servicio contractuales.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-primary font-bold uppercase tracking-widest text-xs">03. Omnicanalidad</h3>
            <p className="text-zinc-500 text-sm">Centralice sus solicitudes y técnicos en una sola interfaz inteligente.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
