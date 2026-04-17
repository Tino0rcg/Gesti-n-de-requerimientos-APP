import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Gestor UI Premium",
  description: "Plataforma de gestión multicompañía de última generación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans min-h-screen relative bg-background text-foreground selection:bg-primary/30`}
      >
        {/* Absolute Background Mesh */}
        <div className="fixed inset-0 -z-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#030712] to-[#030712]"></div>
        
        {children}
        <Toaster />
      </body>
    </html>
  );
}
