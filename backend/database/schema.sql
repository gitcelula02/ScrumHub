-- ============================================
-- ScrumHub Database Schema for Supabase
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- 1. Tabla de Usuarios (tabla principal de autenticación)
CREATE TABLE IF NOT EXISTS "User" (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS project (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id BIGINT REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla intermedia Proyecto-Usuario (miembros del proyecto)
CREATE TABLE IF NOT EXISTS projectuser (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES project(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES "User"(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'DEV', -- PO, DEV, VIEWER
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 4. Tabla de Elementos del Backlog (Tareas, Historias)
CREATE TABLE IF NOT EXISTS backlogitem (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES project(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO', -- TODO, IN_PROGRESS, BLOCKED, DONE
  priority INTEGER DEFAULT 2, -- 1=high, 2=medium, 3=low
  due_date TIMESTAMPTZ,
  type TEXT DEFAULT 'TASK', -- TASK, STORY, BUG, EPIC
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Índices para mejorar el rendimiento
-- ============================================

CREATE INDEX IF NOT EXISTS idx_project_owner ON project(owner_id);
CREATE INDEX IF NOT EXISTS idx_projectuser_project ON projectuser(project_id);
CREATE INDEX IF NOT EXISTS idx_projectuser_user ON projectuser(user_id);
CREATE INDEX IF NOT EXISTS idx_backlogitem_project ON backlogitem(project_id);
CREATE INDEX IF NOT EXISTS idx_backlogitem_status ON backlogitem(status);
CREATE INDEX IF NOT EXISTS idx_backlogitem_type ON backlogitem(type);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);

-- ============================================
-- Datos de prueba (opcional)
-- ============================================

-- Usuario admin por defecto (password: admin123)
-- El hash es generado con bcrypt con 10 rounds
INSERT INTO "User" (email, password_hash, name)
VALUES (
  'admin@proyecto.com',
  '$2a$10$rQZ8vXJh5K9jZJZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
  'Administrador'
)
ON CONFLICT (email) DO NOTHING;

-- Nota: El hash de contraseña de arriba es un ejemplo.
-- Para usar la contraseña 'admin123', genera el hash correcto con bcrypt:
-- bcrypt.hashSync('admin123', 10) en Node.js

-- ============================================
-- Row Level Security (RLS) - Opcional pero recomendado
-- ============================================

-- Habilitar RLS en las tablas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE project ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectuser ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlogitem ENABLE ROW LEVEL SECURITY;

-- Políticas para User (cada usuario solo puede ver su propio registro)
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own data" ON "User"
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Políticas para Project (usuarios pueden ver proyectos donde son miembros)
CREATE POLICY "Users can view projects" ON project
  FOR SELECT USING (
    owner_id = auth.uid()::bigint OR
    EXISTS (SELECT 1 FROM projectuser WHERE project_id = project.id AND user_id = auth.uid()::bigint)
  );

-- Políticas para BacklogItem (usuarios pueden ver items de proyectos donde son miembros)
CREATE POLICY "Users can view backlog items" ON backlogitem
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project
      WHERE id = backlogitem.project_id
      AND (owner_id = auth.uid()::bigint OR EXISTS (
        SELECT 1 FROM projectuser WHERE project_id = project.id AND user_id = auth.uid()::bigint
      ))
    )
  );

-- ============================================
-- Fin del script
-- ============================================
