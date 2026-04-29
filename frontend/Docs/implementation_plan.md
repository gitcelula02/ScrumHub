# Checklist Detallado de Funcionalidades Faltantes: ScrumHub

Tras analizar el código fuente (`Layout.tsx`, `data.ts`, `router.tsx`, etc.), se confirma que la aplicación actualmente funciona como una interfaz gráfica interactiva (maqueta o *mockup* avanzado) que maneja su estado localmente, pero carece de la infraestructura backend real.

A continuación, presento el listado exhaustivo de todas las funcionalidades y conexiones que faltan por implementar para que el sistema sea completamente operativo en un entorno de producción.

## 1. Autenticación y Autorización (Login)
Actualmente no existe protección de rutas ni identificación de usuarios.
- [ ] **Página de Login/Registro:** Crear la interfaz gráfica para el inicio de sesión.
- [ ] **Integración OAuth 2.0:** Implementar inicio de sesión con Google y GitHub (mencionado en el ticket `SCR-101`).
- [ ] **Gestión de Sesiones (JWT/Cookies):** Generación, almacenamiento y validación de tokens de sesión mediante cookies `httpOnly`.
- [ ] **Protección de Rutas:** Configurar TanStack Router para redirigir al login si el usuario no está autenticado.
- [ ] **Gestor de Perfil de Usuario:** Subida de avatares, cambio de nombre, configuración de preferencias de la cuenta.
- [ ] **Control de Acceso Basado en Roles (RBAC):** Conectar la vista `PermissionsView` con la base de datos real. Validar permisos en el backend antes de permitir la creación o borrado de tickets.

## 2. Navegación y Enrutamiento (TanStack Router)
Todo el sistema de "pestañas" (Tabs) y navegación está simulado localmente mediante el estado de React (`useState` en `Layout.tsx`). Si refrescas la página, pierdes el contexto.
- [ ] **Enrutamiento por URLs:** Sincronizar las pestañas y vistas con la URL. Por ejemplo, al abrir el ticket `SCR-101`, la URL debería cambiar a `/ticket/SCR-101`.
- [ ] **Persistencia de Pestañas Abiertas:** Guardar las pestañas activas del usuario en `localStorage` o en la base de datos para restaurarlas al recargar la página.
- [ ] **Sincronización del panel activo:** La "Activity Bar" y el "Sidebar" deben reflejar el estado correcto basado en la ruta actual.

## 3. Integración con Backend y Base de Datos (CRUD)
Los datos de `data.ts` son estáticos (mocks). Las modificaciones al tablero (drag & drop) no se guardan en ninguna parte.
- [ ] **Configuración de Base de Datos:** Levantar la base de datos (PostgreSQL/Supabase, etc.) y definir los esquemas (Tickets, Usuarios, Equipos, Comentarios, Proyectos).
- [ ] **API de lectura (GET):** Sustituir el listado en `TICKETS` por llamadas reales usando `@tanstack/react-query` para alimentar el Tablero Kanban, el Sidebar y la vista de Épicas.
- [ ] **Creación de Tickets (POST):** Crear un formulario funcional o modal ("Crear Ticket") que envíe los datos al backend y actualice el tablero en tiempo real.
- [ ] **Edición de Tickets (PUT/PATCH):**
  - [ ] Cambiar estados (To Do, In Progress, Review, Done).
  - [ ] Actualizar Story Points, Asignado, Prioridad y Fechas de vencimiento.
  - [ ] Editar descripción (posiblemente integrando un editor de texto enriquecido / Markdown).
- [ ] **Borrado de Tickets (DELETE):** Añadir opción para eliminar o archivar tickets.
- [ ] **Sistema de Comentarios:** Integrar la creación y visualización de comentarios reales vinculados al usuario logueado, con su respectiva marca de tiempo.

## 4. IA y Funcionalidades Inteligentes
- [ ] **Asistente NLP (Parseo a Tickets):** (Mencionado en `SCR-103`) Integrar una API (ej. OpenAI / Anthropic) para que un usuario pueda escribir comandos en lenguaje natural y la IA autocomplete un formulario de creación de ticket.
- [ ] **Alertas Inteligentes (AINotifications):** Actualmente funciona con lógica estática en `AINotifications.tsx`. Se requiere integrarlo con datos reales o procesar resúmenes del sprint dinámicos utilizando IA.

## 5. Notificaciones y Tareas Programadas (Cron)
- [ ] **Notificaciones en Tiempo Real (WebSockets / SSE):** Si un compañero de equipo mueve un ticket en el que estoy trabajando, mi pantalla debe actualizarse sin necesidad de recargar.
- [ ] **Alertas por Correo (Cron Job):** (Mencionado en `SCR-104`) Crear un servicio en el backend que se ejecute a diario para enviar emails a los responsables de los tickets atrasados o de alta prioridad.
- [ ] **Feed de Notificaciones In-App:** El icono de campana debe desplegar notificaciones reales (ej. "Carlos te ha asignado el ticket SCR-102") que se marquen como leídas al hacer clic.

## 6. Funcionalidades de la Interfaz (UI/UX)
- [ ] **Command Palette (Ctrl+Shift+P):** Actualmente `CommandPalette.tsx` muestra opciones estáticas. Debe ser capaz de:
  - [ ] Buscar y navegar a un ticket específico por su ID o título.
  - [ ] Cambiar de tema (Claro/Oscuro) si se va a soportar.
  - [ ] Ejecutar acciones rápidas (Ej. "Crear Ticket", "Cerrar Pestaña Actual").
- [ ] **Exportación a PDF/CSV:** `exportSprintReport(tickets)` en `exportPdf.ts` necesita estar completamente validado para generar un reporte fiable y formateado usando los datos dinámicos.
- [ ] **Responsividad (Mobile):** Optimizar la barra lateral y los paneles colapsables para resoluciones pequeñas, asegurando que la herramienta sea usable fuera del escritorio.
