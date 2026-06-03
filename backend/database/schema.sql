-- ============================================
-- ScrumHub Database Schema for Supabase
-- VERSIÓN CORREGIDA - Ejecuta en SQL Editor
-- ============================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Proyectos (SIN deleted_at - se usa hard delete)
CREATE TABLE IF NOT EXISTS project (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id uuid REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla intermedia Proyecto-Usuario
CREATE TABLE IF NOT EXISTS projectuser (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES project(id) ON DELETE CASCADE,
  user_id uuid REFERENCES "User"(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'DEV',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 4. Tabla de Backlogs (contenedores de items)
CREATE TABLE IF NOT EXISTS backlogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES project(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'custom',
  color TEXT DEFAULT '#3B82F6',
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. Tabla de Items del Backlog
CREATE TABLE IF NOT EXISTS backlogitem (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES project(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES backlogitem(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'TODO',
  priority INTEGER DEFAULT 2,
  due_date TIMESTAMPTZ,
  type TEXT DEFAULT 'TASK',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_project_owner ON project(owner_id);
CREATE INDEX IF NOT EXISTS idx_projectuser_project ON projectuser(project_id);
CREATE INDEX IF NOT EXISTS idx_projectuser_user ON projectuser(user_id);
CREATE INDEX IF NOT EXISTS idx_backlogitem_project ON backlogitem(project_id);
CREATE INDEX IF NOT EXISTS idx_backlogitem_status ON backlogitem(status);
CREATE INDEX IF NOT EXISTS idx_backlogitem_type ON backlogitem(type);
CREATE INDEX IF NOT EXISTS idx_backlogitem_parent ON backlogitem(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_backlogs_project ON backlogs(project_id);

-- ============================================
-- Si ya tienes las tablas, solo agrega columnas faltantes:
-- ============================================
-- ALTER TABLE backlogitem ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES backlogitem(id) ON DELETE SET NULL;
-- ALTER TABLE backlogitem ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- ============================================
-- IMPORTANTE: Deshabilitar RLS para que el backend
-- (service_role) pueda acceder sin restricciones
-- ============================================
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE project DISABLE ROW LEVEL SECURITY;
ALTER TABLE projectuser DISABLE ROW LEVEL SECURITY;
ALTER TABLE backlogitem DISABLE ROW LEVEL SECURITY;
ALTER TABLE backlogs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Usuario de prueba (password: admin123)
-- Hash generado con bcrypt 10 rounds
-- ============================================
-- Para generar el hash correcto ejecuta en Node.js:
-- require('bcryptjs').hashSync('admin123', 10)
-- Luego reemplaza el hash de abajo:

INSERT INTO "User" (email, password_hash, name)
VALUES (
  'admin@proyecto.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Administrador'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Fin del script
-- ============================================
