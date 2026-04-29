import { useEffect, useMemo, useState } from "react";
import { ActivityBar, type ActivityView } from "./ActivityBar";
import { Sidebar } from "./Sidebar";
import { Tabs } from "./Tabs";
import { Board } from "./Board";
import { TicketView, PropertiesPanel } from "./TicketView";
import { EpicsView } from "./EpicsView";
import { PermissionsView } from "./PermissionsView";
import { AINotifications } from "./AINotifications";
import { StatusBar } from "./StatusBar";
import { TitleBar } from "./TitleBar";
import { CommandPalette } from "./CommandPalette";
import { TICKETS, type Tab, type Ticket, type TicketStatus } from "./data";
import { exportSprintReport } from "./exportPdf";

const DASHBOARD_TAB: Tab = { id: "dashboard", label: "Tablero — Sprint 24", kind: "dashboard" };
const EPICS_TAB: Tab = { id: "epics", label: "Épicas", kind: "epics" };
const PERMS_TAB: Tab = { id: "permissions", label: "Permisos del equipo", kind: "permissions" };

export function Layout() {
  const [view, setView] = useState<ActivityView>("projects");
  const [tabs, setTabs] = useState<Tab[]>([DASHBOARD_TAB]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);

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

  const openTicket = (t: Ticket) => {
    openTab({ id: t.id, label: t.id, kind: "ticket", ticketId: t.id });
  };

  const handleViewChange = (v: ActivityView) => {
    setView(v);
    if (v === "epics") openTab(EPICS_TAB);
    else if (v === "permissions") openTab(PERMS_TAB);
    else if (v === "projects" || v === "backlog" || v === "sprints") {
      openTab(DASHBOARD_TAB);
    }
  };

  const closeTab = (id: string) => {
    if (id === "dashboard") return;
    setTabs((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeTab === id) setActiveTab(next[next.length - 1]?.id ?? "dashboard");
      return next;
    });
  };

  const moveTicket = (id: string, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const current = tabs.find((t) => t.id === activeTab) ?? DASHBOARD_TAB;
  const currentTicket =
    current.kind === "ticket" ? tickets.find((t) => t.id === current.ticketId) : null;
  const sidebarActiveId = currentTicket?.id ?? null;

  const alertCount = useMemo(() => {
    const now = new Date("2026-04-29");
    return tickets.filter((t) => {
      if (t.status === "done") return false;
      const d = new Date(t.due);
      const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
      return days < 0 || (days <= 2 && t.priority === "high");
    }).length + 1;
  }, [tickets]);

  return (
    <div className="h-screen w-screen flex flex-col bg-editor text-foreground overflow-hidden">
      <TitleBar onPalette={() => setPaletteOpen(true)} />
      <div className="flex-1 flex min-h-0">
        <ActivityBar
          active={view}
          onChange={handleViewChange}
          onNotifications={() => setNotificationsOpen(true)}
          onExport={() => exportSprintReport(tickets)}
          alertCount={alertCount}
        />
        <Sidebar view={view} tickets={tickets} activeId={sidebarActiveId} onOpen={openTicket} />
        <main className="flex-1 flex flex-col min-w-0">
          <Tabs tabs={tabs} activeId={activeTab} onSelect={setActiveTab} onClose={closeTab} />
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0">
              {current.kind === "dashboard" && (
                <Board tickets={tickets} onOpen={openTicket} onMove={moveTicket} />
              )}
              {current.kind === "epics" && (
                <EpicsView tickets={tickets} onOpen={openTicket} />
              )}
              {current.kind === "permissions" && <PermissionsView />}
              {current.kind === "ticket" && currentTicket && (
                <TicketView ticket={currentTicket} />
              )}
            </div>
            {currentTicket && <PropertiesPanel ticket={currentTicket} />}
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
        tickets={tickets}
      />
    </div>
  );
}
