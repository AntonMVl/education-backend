-- Создание enum для прав доступа
CREATE TYPE permission_enum AS ENUM (
  'create_users',
  'delete_users', 
  'edit_users',
  'manage_courses',
  'manage_lectures',
  'manage_tests',
  'review_exams',
  'manage_admins'
);

-- Создание таблицы прав администраторов
CREATE TABLE IF NOT EXISTS admin_permissions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  permission permission_enum NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by INTEGER,
  
  -- Внешние ключи
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Уникальный индекс для предотвращения дублирования прав
  UNIQUE(admin_id, permission)
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin_id ON admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_permission ON admin_permissions(permission);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_granted_by ON admin_permissions(granted_by); 