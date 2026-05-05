import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, Github, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authService } from "../services/authService";
import { useAuthSession } from "../hooks/useAuthSession";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

/**
 * @component LoginPage
 * Premium login page with VS Code styling.
 */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useAuthSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await authService.login({ email, password });
      auth.login(response.token, response.user);
      toast.success("Bienvenido de nuevo");
      navigate({ to: "/app/dashboard" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-editor p-4">
      <div className="w-full max-w-[400px] bg-sidebar-bg border border-panel-border rounded-sm shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-status-bar rounded-sm flex items-center justify-center mb-4 text-status-bar-fg shadow-lg shadow-status-bar/20">
            <LogIn size={24} />
          </div>
          <h1 className="text-xl font-bold text-foreground">Bienvenido a ScrumHub</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión ágil estilo VS Code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                id="email"
                type="email"
                placeholder="nombre@riwi.io"
                className="pl-9 bg-editor border-panel-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                id="password"
                type="password"
                className="pl-9 bg-editor border-panel-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-status-bar hover:bg-status-bar/90 text-status-bar-fg font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-panel-border"></span>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-sidebar-bg px-2 text-muted-foreground">O continuar con</span>
          </div>
        </div>

        <Button variant="outline" className="w-full border-panel-border hover:bg-list-hover gap-2 text-foreground">
          <Github size={16} /> GitHub
        </Button>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-status-bar hover:underline font-semibold">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * @component RegisterPage
 * Premium registration page.
 */
export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-editor p-4 text-foreground">
      <div className="w-full max-w-[400px] text-center">
        <h1 className="text-2xl font-bold mb-4 text-status-bar">Próximamente</h1>
        <p className="text-muted-foreground mb-8">Estamos construyendo el futuro de la gestión ágil.</p>
        <Link to="/login" className="text-sm hover:underline font-mono">
          {"<-- Volver al login"}
        </Link>
      </div>
    </div>
  );
}
