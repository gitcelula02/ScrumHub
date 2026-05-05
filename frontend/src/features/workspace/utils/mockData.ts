export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  reporter: string;
  project: string;
  epic: string;
  sprint: string;
  points: number;
  due: string;
  labels: string[];
  comments: { author: string; when: string; body: string }[];
}

export interface Tab {
  id: string;
  label: string;
  kind: "dashboard" | "task" | "epics" | "permissions";
  taskId?: string;
}

export const TASKS: Task[] = [
  {
    id: "SCR-101",
    title: "Implementar login con OAuth (Google + GitHub)",
    description:
      "Integrar el flujo OAuth 2.0 para Google y GitHub. Persistir sesión con JWT en cookie httpOnly. Añadir tests E2E.",
    status: "in-progress",
    priority: "high",
    assignee: "Ana Torres",
    reporter: "María Ruiz",
    project: "scrumhub-core",
    epic: "Autenticación",
    sprint: "Sprint 24",
    points: 8,
    due: "2026-05-04",
    labels: ["auth", "backend", "security"],
    comments: [
      { author: "María Ruiz", when: "hace 2h", body: "Recordemos rotar el client secret en producción." },
      { author: "Ana Torres", when: "hace 30m", body: "Listo el callback de Google, voy con GitHub." },
    ],
  },
  {
    id: "SCR-102",
    title: "Diseñar tablero Kanban arrastrable",
    description: "Soporte de drag & drop entre columnas con persistencia optimista.",
    status: "todo",
    priority: "medium",
    assignee: "Carlos Pinto",
    reporter: "María Ruiz",
    project: "scrumhub-core",
    epic: "Tableros",
    sprint: "Sprint 24",
    points: 5,
    due: "2026-05-09",
    labels: ["frontend", "ux"],
    comments: [],
  },
  {
    id: "SCR-103",
    title: "Asistente IA: parsear lenguaje natural a tareas",
    description: "El asistente debe interpretar 'crea un bug crítico para el login y asígnalo a Ana'.",
    status: "in-progress",
    priority: "high",
    assignee: "Lucía Méndez",
    reporter: "María Ruiz",
    project: "scrumhub-core",
    epic: "IA",
    sprint: "Sprint 24",
    points: 13,
    due: "2026-05-12",
    labels: ["ai", "nlp"],
    comments: [
      { author: "Lucía Méndez", when: "ayer", body: "Primer prompt funcionando con 87% accuracy." },
    ],
  },
  {
    id: "SCR-104",
    title: "Alertas por correo según prioridad y vencimiento",
    description: "Cron diario que notifica responsables de tareas vencidas o de alta prioridad.",
    status: "review",
    priority: "medium",
    assignee: "Diego Salas",
    reporter: "Ana Torres",
    project: "scrumhub-core",
    epic: "Notificaciones",
    sprint: "Sprint 24",
    points: 3,
    due: "2026-04-30",
    labels: ["email", "cron"],
    comments: [],
  },
  {
    id: "SCR-105",
    title: "Roles y permisos por equipo",
    description: "Tabla user_roles separada con políticas RLS y función has_role.",
    status: "done",
    priority: "high",
    assignee: "Ana Torres",
    reporter: "María Ruiz",
    project: "scrumhub-core",
    epic: "Equipos",
    sprint: "Sprint 23",
    points: 5,
    due: "2026-04-22",
    labels: ["security", "db"],
    comments: [{ author: "Ana Torres", when: "hace 5d", body: "Mergeado y desplegado en prod." }],
  },
  {
    id: "WEB-201",
    title: "Landing pública con métricas en tiempo real",
    description: "Hero, demo animada y stats de uso.",
    status: "todo",
    priority: "low",
    assignee: "Carlos Pinto",
    reporter: "María Ruiz",
    project: "scrumhub-web",
    epic: "Marketing",
    sprint: "Sprint 24",
    points: 5,
    due: "2026-05-15",
    labels: ["marketing", "frontend"],
    comments: [],
  },
  {
    id: "WEB-202",
    title: "Documentación de la API pública",
    description: "Generar docs con OpenAPI y publicar en /docs.",
    status: "in-progress",
    priority: "medium",
    assignee: "Diego Salas",
    reporter: "Ana Torres",
    project: "scrumhub-web",
    epic: "Documentación",
    sprint: "Sprint 24",
    points: 3,
    due: "2026-05-08",
    labels: ["docs", "api"],
    comments: [],
  },
];
