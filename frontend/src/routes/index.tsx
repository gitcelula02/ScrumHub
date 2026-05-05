import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, Zap, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/**
 * @component LandingPage
 * High-fidelity public landing page for ScrumHub.
 */
function LandingPage() {
  return (
    <div className="min-h-screen bg-editor text-foreground selection:bg-status-bar/30">
      {/* Navigation */}
      <nav className="h-14 border-b border-panel-border flex items-center justify-between px-8 bg-titlebar">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-status-bar rounded-sm flex items-center justify-center text-[12px] font-bold text-status-bar-fg">
            SH
          </div>
          <span className="font-semibold tracking-tight">ScrumHub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm hover:text-status-bar transition-colors">Iniciar Sesión</Link>
          <Link to="/register" className="h-8 px-4 flex items-center bg-status-bar text-status-bar-fg rounded-sm text-sm font-semibold hover:opacity-90">
            Pruébalo gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-8 pt-24 pb-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-bar/10 border border-status-bar/20 text-status-bar text-xs font-mono mb-6">
            <Sparkles size={14} /> Nueva era de gestión ágil
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Gestión de proyectos <br /> al estilo VS Code.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Un entorno de desarrollo ágil modular, rápido y potenciado por IA. 
            Menos clics, más código, mejor Scrum.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="h-12 px-8 flex items-center bg-status-bar text-status-bar-fg rounded-sm text-lg font-bold hover:shadow-lg hover:shadow-status-bar/20 transition-all">
              Comenzar ahora
            </Link>
            <Button variant="outline" className="h-12 px-8 border-panel-border hover:bg-list-hover text-lg">
              Ver documentación
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          <FeatureCard 
            icon={<FolderKanban className="text-status-bar" />} 
            title="Workspace Modular" 
            description="Organiza tus épicas, tareas y sprints en una interfaz familiar de explorador de archivos."
          />
          <FeatureCard 
            icon={<Zap className="text-priority-med" />} 
            title="TanStack Powered" 
            description="Navegación instantánea y estado del servidor siempre sincronizado."
          />
          <FeatureCard 
            icon={<Shield className="text-status-done" />} 
            title="Seguridad de Grado Scrum" 
            description="Control granular de permisos y roles de equipo integrados nativamente."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-sidebar-bg border border-panel-border rounded-sm hover:border-status-bar/40 transition-colors group">
      <div className="w-10 h-10 rounded-sm bg-editor flex items-center justify-center mb-4 border border-panel-border group-hover:border-status-bar/20">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

// Minimal Button internal to landing if UI atoms are not ready for landing
function Button({ variant, className, children, ...props }: any) {
  return (
    <button 
      className={cn(
        "px-4 rounded-sm transition-colors",
        variant === "outline" ? "border border-panel-border hover:bg-list-hover" : "bg-status-bar text-status-bar-fg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

import { cn } from "@/lib/utils";
