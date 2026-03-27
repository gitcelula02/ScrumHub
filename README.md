# TaskFlow - Sistema de Gestión de Proyectos con IA

Un sistema de gestión de proyectos similar a Jira con asistente de IA integrado para crear tareas, asignar responsables, gestionar prioridades y enviar alertas automáticas por correo electrónico.

## Características

- 🔐 **Sistema de autenticación** (login/registro)
- 📋 **Tableros tipo Jira** con columnas personalizables
- 🤖 **Asistente de IA** que entiende lenguaje natural
- 📧 **Alertas por correo** basadas en fechas y prioridades
- 👥 **Gestión de equipos** y permisos
- 📊 **Dashboard** con estadísticas en tiempo real
- 📱 **Diseño responsive**

## Arquitectura MVC

```
proyecto-jira/
├── backend/
│   ├── config/          # Configuración de base de datos
│   ├── controllers/     # Controladores (lógica de negocio)
│   ├── models/          # Modelos (datos y operaciones)
│   ├── routes/          # Rutas de la API
│   ├── services/        # Servicios (IA, notificaciones)
│   ├── middleware/       # Middlewares (autenticación)
│   └── server.js        # Punto de entrada
├── frontend/
│   ├── public/
│   │   ├── css/         # Estilos
│   │   └── js/          # JavaScript del cliente
│   └── views/           # Páginas HTML
├── data/                # Archivos JSON (base de datos)
├── .env                 # Variables de entorno
└── package.json
```

## Instalación

1. **Clonar o entrar al directorio:**
   ```bash
   cd proyecto-jira
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Edita el archivo `.env`:
   ```env
   PORT=3000
   SESSION_SECRET=tu_clave_secreta
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=password_de_aplicacion
   AI_API_KEY=tu_api_key_openai (opcional)
   ```

4. **Iniciar el servidor:**
   ```bash
   npm start
   # o para desarrollo con recarga automática:
   npm run dev
   ```

5. **Abrir en el navegador:**
   - Landing: http://localhost:3000/
   - Login: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard

## Credenciales de Prueba

- **Email:** admin@proyecto.com
- **Password:** admin123

## Comandos del Asistente de IA

El chat de IA acepta los siguientes comandos en lenguaje natural:

### Crear tareas
- "crear tarea [título]"
- "nueva tarea [título]"
- "crear task [título]"

### Asignar tareas
- "asignar a [nombre] #123"
- Asigna la tarea #123 a un miembro del equipo

### Cambiar prioridad
- "cambiar prioridad alta #123"
- "prioridad baja"

### Establecer fecha
- "fecha 25/12/2024 #123"
- "vencimiento 31/12/2024"

### Crear proyectos
- "crear proyecto [nombre]"

### Buscar tareas
- "buscar [término]"

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

### Proyectos
- `GET /api/projects/all` - Listar proyectos
- `GET /api/projects/:id` - Detalles del proyecto
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto
- `POST /api/projects/:id/members` - Agregar miembro

### Tareas
- `GET /api/tasks` - Listar todas las tareas
- `GET /api/tasks/my-tasks` - Tareas del usuario actual
- `GET /api/tasks/project/:projectId` - Tareas del proyecto
- `GET /api/tasks/:id` - Detalles de tarea
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `POST /api/tasks/:id/comments` - Agregar comentario

### IA
- `POST /api/ai/chat` - Chat con IA
- `POST /api/ai/check-alerts` - Verificar y enviar alertas

## Tecnologías

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Base de datos:** JSON files (simulada)
- **Auth:** express-session, bcrypt
- **Email:** nodemailer
- **IA:** Procesamiento de lenguaje natural (integrado)

## Notas de Desarrollo

- La base de datos es archivos JSON en la carpeta `data/`
- Las alertas de correo se envían automáticamente cada hora
- La IA procesa comandos en español de forma nativa
- No requiere API key externa para funcionamiento básico
