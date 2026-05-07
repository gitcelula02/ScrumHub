import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityBar } from "./ActivityBar";
import { StatusBar } from "./StatusBar";
import { TitleBar } from "./TitleBar";
import { Explorer, Tabs, CommandPalette } from "@/features/workspace";
import { AINotifications } from "@/features/ai";
import { useTasks } from "@/features/backlog";
import type { Tab, Task } from "@/types";
import { Outlet, useParams } from "@tanstack/react-router";

const DASHBOARD_TAB: Tab = { id: "dashboard", label: "Tablero", kind: "dashboard" };

/**
 * @component AppShell
 * Main application layout container. Renders the shell (TitleBar, ActivityBar,
 * Explorer, Tabs, StatusBar) and uses TanStack Router's <Outlet /> to render
 * child route content.
 */
export function AppShell({ children }: { children?: ReactNode }) {
  const params = useParams({ from: "/app/projects/$projectId", strict: false });
  const { data: tasks = [] } = useTasks();
  const [tabs, setTabs] = useState<Tab[]>([DASHBOARD_TAB]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const projectId = params.projectId;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openTab = (tab: Tab) => {
    setTabs((prev) => (prev.find((p) => p.id === tab.id) ? prev : [...prev, tab]));
    setActiveTab(tab.id);
  };

  const openTask = (t: Task) => {
    openTab({ id: t.id, label: t.id, kind: "task", taskId: t.id });
  };

  const closeTab = (id: string) => {
    if (id === "dashboard") return;
    setTabs((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeTab === id) setActiveTab(next[next.length - 1]?.id ?? "dashboard");
      return next;
    });
  };

  const current = tabs.find((t) => t.id === activeTab) ?? DASHBOARD_TAB;

  const alertCount = useMemo(() => {
    const now = new Date("2026-04-29");
    return tasks.filter((t) => {
      if (t.status === "done") return false;
      const d = new Date(t.due);
      const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
      return days < 0 || (days <= 2 && t.priority === "high");
    }).length + 1;
  }, [tasks]);

  return (
    <div className="h-screen w-screen flex flex-col bg-editor text-foreground overflow-hidden">
      <TitleBar onPalette={() => setPaletteOpen(true)} />
      <div className="flex-1 flex min-h-0">
        <ActivityBar
          onNotifications={() => setNotificationsOpen(true)}
          projectId={projectId}
        />
        <Explorer view="projects" tasks={tasks} activeId={null} onOpen={openTask} />
        <main className="flex-1 flex flex-col min-w-0">
          <Tabs tabs={tabs} activeId={activeTab} onSelect={setActiveTab} onClose={closeTab} />
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0">
{children || <Outlet />}
            </div>
          </div>
        </main>
      </div>
      <StatusBar
        branch="main"
        onPalette={() => setPaletteOpen(true)}
        alertCount={alertCount}
        onNotifications={() => setNotificationsOpen(true)}
      />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <AINotifications
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
