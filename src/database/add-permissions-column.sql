-- Добавление поля permissions в таблицу пользователей
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "permissions" text[];

-- Обновление существующих пользователей
-- Суперадмины получают все права
UPDATE "user" 
SET "permissions" = ARRAY[
    'create_users',
    'delete_users', 
    'edit_users',
    'manage_courses',
    'manage_lectures',
    'manage_tests',
    'review_exams',
    'manage_admins',
    'manage_admin_permissions'
]
WHERE "role" = 'superadmin';

-- Админы по умолчанию не имеют прав на управление админами
UPDATE "user" 
SET "permissions" = ARRAY[
    'create_users',
    'delete_users', 
    'edit_users',
    'manage_courses',
    'manage_lectures',
    'manage_tests',
    'review_exams'
]
WHERE "role" = 'admin' AND "permissions" IS NULL;

-- Обычные пользователи не имеют прав
UPDATE "user" 
SET "permissions" = ARRAY[]::text[]
WHERE "role" = 'user' AND "permissions" IS NULL; 