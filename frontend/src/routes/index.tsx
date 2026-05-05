import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScrumHub — Gestión ágil con IA al estilo VS Code" },
      {
        name: "description",
        content:
          "ScrumHub es un gestor de proyectos ágil estilo Jira con asistente de IA, tableros, alertas y una interfaz inspirada en VS Code.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppShell />;
}
