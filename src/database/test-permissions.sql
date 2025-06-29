-- Тестовый скрипт для проверки прав пользователей

-- 1. Показать всех пользователей с их правами
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "login", 
    "role", 
    "permissions",
    "createdAt"
FROM "user" 
ORDER BY "role", "id";

-- 2. Показать только администраторов
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "login", 
    "permissions"
FROM "user" 
WHERE "role" = 'admin'
ORDER BY "id";

-- 3. Показать администраторов с правом manage_admins
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "login", 
    "permissions"
FROM "user" 
WHERE "role" = 'admin' 
    AND "permissions" @> ARRAY['manage_admins']
ORDER BY "id";

-- 4. Показать администраторов с правом manage_admin_permissions
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "login", 
    "permissions"
FROM "user" 
WHERE "role" = 'admin' 
    AND "permissions" @> ARRAY['manage_admin_permissions']
ORDER BY "id";

-- 5. Показать суперадминистраторов
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "login", 
    "permissions"
FROM "user" 
WHERE "role" = 'superadmin'
ORDER BY "id";

-- 6. Показать обычных пользователей
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "login", 
    "permissions"
FROM "user" 
WHERE "role" = 'user'
ORDER BY "id";

-- 7. Проверить, есть ли у конкретного пользователя определенное право
-- Замените [USER_ID] на ID пользователя и [PERMISSION] на название права
SELECT 
    "id", 
    "firstName", 
    "lastName", 
    "role",
    "permissions" @> ARRAY['[PERMISSION]'] as has_permission
FROM "user" 
WHERE "id" = [USER_ID]; 