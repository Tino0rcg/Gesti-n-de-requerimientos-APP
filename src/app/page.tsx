import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Activity,
  MessageSquare,
  Headphones
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[60%] h-[40%] bg-blue-400/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Modern Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="https://github.com/Tino0rcg/imagenes-pagina-online-2.0/blob/main/LOGO%20ONLINE%20SYSTEM%20NORMAL.png?raw=true" 
              alt="Online System Logo" 
              width={110} 
              height={110}
              className="object-contain -my-8 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            />
            <span className="text-xl font-bold tracking-tight text-white uppercase italic">Online<span className="text-blue-500 font-light">System</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-semibold px-6 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
                Ingresar al Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Plataforma de Soporte Tecnológico
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-8 max-w-5xl">
          Gestión de Servicios <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Inteligente & Rápida.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mb-10 text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">
          Optimiza la resolución de incidentes, controla tus SLAs en tiempo real y centraliza las operaciones de tu equipo técnico con nuestra plataforma de próxima generación.
        </p>


      </section>



      {/* Footer Minimal */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Image 
                  src="https://github.com/Tino0rcg/imagenes-pagina-online-2.0/blob/main/LOGO%20ONLINE%20SYSTEM%20NORMAL.png?raw=true" 
                  alt="Online System Logo" 
                  width={20} 
                  height={20}
                  className="object-contain opacity-50"
                />
                <span className="font-bold text-sm text-zinc-300">Online System © {new Date().getFullYear()}</span>
            </div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Plataforma Asegurada y Restringida</p>
        </div>
      </footer>

    </div>
  );
}
