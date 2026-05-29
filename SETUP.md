# Guía de Configuración - ScrumHub

## Paso 1: Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto (o usa uno existente)
2. Ve al **SQL Editor** en el menú izquierdo
3. Copia y pega el contenido de `backend/database/schema.sql`
4. Ejecuta el script para crear las tablas

### Obtener credenciales de Supabase

1. Ve a **Settings** (engranaje) → **API**
2. Copia los siguientes valores:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (¡No compartir!)

## Paso 2: Configurar MongoDB

### Opción A: MongoDB Atlas (Recomendado)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Inicia sesión o crea una cuenta gratuita
3. Crea un nuevo cluster (M0 Free tier está bien)
4. Crea un usuario de base de datos en **Database Access**
5. En **Network Access**, añade `0.0.0.0/0` (allow all IPs)
6. Click en **Connect** → **Connect your application**
7. Copia la conexión string y reemplaza `<password>` con tu contraseña
8. Pega el URI completo en `MONGODB_URI` en tu `.env`

### Opción B: MongoDB Local

Si tienes MongoDB instalado localmente:
```
MONGODB_URI=mongodb://localhost:27017/ScrumHub
```

## Paso 3: Configurar variables de entorno

Copia el archivo `backend/.env.example` a `backend/.env` y edítalo:

```bash
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ScrumHub

# Session
SESSION_SECRET=cualquier-string-aleatorio-seguro

# Server internal port
PORT=3000

# Docker Host Ports (The ports expuestos a tu máquina local)
HOST_BACKEND_PORT=3000
HOST_FRONTEND_PORT=8080

# Docker API URL (use when running via docker-compose)
# This replaces localhost with the Docker service name for internal networking
VITE_API_URL_DOCKER=http://backend:3000/api

NODE_ENV=development
```

## Paso 4: Instalar dependencias del backend

```bash
cd backend
pnpm install
```

## Paso 5: Ejecutar el proyecto

### Opción 1: Ejecución Manual

**Desarrollo (con auto-reload)**
```bash
cd backend
pnpm run dev
```

**Producción**
```bash
cd backend
pnpm start
```

El servidor estará disponible en: http://localhost:3000

### Opción 2: Ejecutar con Docker (Recomendado)

Si tienes Docker y Docker Compose instalados, puedes levantar todo el entorno (frontend y backend) con un solo comando.

**Iniciar el entorno de desarrollo:**
```bash
# Set the Docker API URL before starting
export VITE_API_URL_DOCKER=http://backend:3000/api
docker-compose -f docker-compose.dev.yml up -d --build
```
*Frontend disponible en http://localhost:8080*
*Backend disponible en http://localhost:3000*

**Detener el entorno:**
```bash
docker-compose -f docker-compose.dev.yml down
```

**Detener el entorno y limpiar volúmenes (reiniciar base de datos / dependencias):**
```bash
docker-compose -f docker-compose.dev.yml down -v
```

**Reconstruir imágenes (Útil si añades nuevas dependencias en package.json):**
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

## Usuarios de prueba

Después de ejecutar el script SQL, puedes usar:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@proyecto.com | admin123 | Admin |

**Nota:** Si el usuario no existe, regístrate manualmente en http://localhost:3001/register

## Troubleshooting

### Error: "Supabase credentials missing"
- Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configurados en `backend/.env`

### Error: "MongoDB connection error"
- Verifica que el URI de MongoDB sea correcto
- Si usas Atlas, verifica que tu IP esté permitida en Network Access
- Reemplaza `<db_password>` con tu contraseña real

### Error: "table does not exist"
- Ejecuta el script `backend/database/schema.sql` en Supabase SQL Editor
- Verifica que las tablas se crearon correctamente

### Error: "authentication failed" en MongoDB
- La contraseña en el URI debe estar URL-encoded (usa %40 en vez de @, etc.)
- Ejemplo: `mongodb+srv://user:My%40Password@cluster...`

## Estructura de tablas en Supabase

```
User
├── id (BIGSERIAL, PK)
├── email (TEXT, UNIQUE)
├── password_hash (TEXT)
└── name (TEXT)

project
├── id (BIGSERIAL, PK)
├── name (TEXT)
├── description (TEXT)
└── owner_id (FK → User.id)

projectuser
├── id (BIGSERIAL, PK)
├── project_id (FK → project.id)
├── user_id (FK → User.id)
└── role (TEXT: PO, DEV, VIEWER)

backlogitem
├── id (BIGSERIAL, PK)
├── project_id (FK → project.id)
├── title (TEXT)
├── description (TEXT)
├── status (TEXT: TODO, IN_PROGRESS, BLOCKED, DONE)
├── priority (INTEGER: 1=high, 2=medium, 3=low)
├── due_date (TIMESTAMPTZ)
└── type (TEXT: TASK, STORY, BUG, EPIC)
```