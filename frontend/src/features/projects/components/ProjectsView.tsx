import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Bell, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProjectCard } from "./ProjectCard";
import { useProjects } from "../hooks/useProjects";
import { useAuth } from "@/store/useAuth";
import type { ProjectStatus, ProjectTab } from "../types";

const TABS: { value: ProjectTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "planning", label: "Planificado" },
  { value: "paused", label: "Pausado" },
  { value: "archived", label: "Archivado" },
];

/**
 * @component ProjectsView
 * Smart feature component for the projects dashboard.
 * Handles data fetching and view logic, delegates to dumb components.
 */
export function ProjectsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, isLoading } = useProjects();
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(Boolean);

    if (activeTab !== "all") {
      filtered = filtered.filter((p) => p.status === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.key && p.key.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [projects, activeTab, searchQuery]);

  const featuredProjects = useMemo(() => {
    return filteredProjects.filter((p) => p.status === "active").slice(0, 3);
  }, [filteredProjects]);

  const regularProjects = useMemo(() => {
    if (activeTab === "all") {
      return filteredProjects.filter((p) => !featuredProjects.includes(p));
    }
    return filteredProjects;
  }, [filteredProjects, featuredProjects, activeTab]);

  const handleProjectClick = (projectId: string) => {
    navigate({
      to: "/app/projects/$projectId/dashboard",
      params: { projectId },
    });
  };

  const getLeadName = (ownerId: string): string => {
    if (ownerId === "1") return "Carlos Administrator";
    if (ownerId === "2") return "María García";
    return `User ${ownerId}`;
  };

  const getMemberCount = (members: string[]): number => {
    return members?.length || 0;
  };

  const getTaskCount = (projectId: string): number => {
    return Math.floor(Math.random() * 12) + 1;
  };

  const getEpicCount = (projectId: string): number => {
    return Math.floor(Math.random() * 4) + 1;
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "AD";

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-editor">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2 text-foreground">
            Cargando proyectos...
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            Obteniendo workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-editor">
      {/* Top Navigation Bar */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-panel-border bg-titlebar shrink-0">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-[13px] font-bold">
            S
          </div>
          <span className="text-[13px] text-muted-foreground">
            ScrumHub /{" "}
            <span className="text-foreground">Proyectos</span>
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="relative w-96">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar proyecto, lead o clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-16 h-9 bg-editor border-panel-border text-[13px]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
            Ctrl+K
          </span>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell size={16} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings size={16} className="text-muted-foreground" />
          </Button>
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-[10px] text-white font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Proyectos</h1>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">
              {projects.length} proyectos · {projects.filter((p) => p.status === "active").length} activos
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/app/projects/create" })}
            className="gap-2"
          >
            <Plus size={16} />
            Nuevo proyecto
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ProjectTab)}
          className="mb-6"
        >
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package
              size={48}
              className="text-muted-foreground/30 mb-4"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay proyectos
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {searchQuery
                ? "No se encontraron proyectos que coincidan con tu búsqueda."
                : "Aún no has creado ningún proyecto. ¡Empieza creando tu primer proyecto!"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate({ to: "/app/projects/create" })}>
                <Plus size={16} className="mr-2" />
                Crear proyecto
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Projects Section */}
            {activeTab === "all" && featuredProjects.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-yellow-500/80 uppercase">
                    ★ Destacados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {featuredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      leadName={getLeadName(project.owner)}
                      taskCount={getTaskCount(project.id)}
                      epicCount={getEpicCount(project.id)}
                      memberCount={getMemberCount(project.members)}
                      isFeatured={true}
                      onClick={() => handleProjectClick(project.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Projects Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                  {activeTab === "all" ? "Todos los proyectos" : TABS.find((t) => t.value === activeTab)?.label}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(activeTab === "all" ? regularProjects : filteredProjects).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    leadName={getLeadName(project.owner)}
                    taskCount={getTaskCount(project.id)}
                    epicCount={getEpicCount(project.id)}
                    memberCount={getMemberCount(project.members)}
                    onClick={() => handleProjectClick(project.id)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}