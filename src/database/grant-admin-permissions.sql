-- Скрипт для предоставления прав администраторам
-- Замените [ADMIN_ID] на ID администратора, которому нужно предоставить права

-- 1. Предоставление права на управление администраторами (включает автоматическое предоставление прав на управление пользователями)
UPDATE "user" 
SET "permissions" = array_append(
    COALESCE("permissions", ARRAY[]::text[]), 
    'manage_admins'
)
WHERE "id" = [ADMIN_ID] AND "role" = 'admin';

-- 2. Предоставление права на управление правами других администраторов
UPDATE "user" 
SET "permissions" = array_append(
    COALESCE("permissions", ARRAY[]::text[]), 
    'manage_admin_permissions'
)
WHERE "id" = [ADMIN_ID] AND "role" = 'admin';

-- 3. Проверка результата
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "role", 
    "permissions"
FROM "user" 
WHERE "id" = [ADMIN_ID];

-- 4. Удаление дубликатов из массива permissions (если есть)
UPDATE "user" 
SET "permissions" = array(
    SELECT DISTINCT unnest("permissions")
    FROM "user" 
    WHERE "id" = [ADMIN_ID]
)
WHERE "id" = [ADMIN_ID]; 