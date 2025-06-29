-- Простой скрипт для установки базовых паролей
-- ВНИМАНИЕ: Это временное решение для исправления ошибки хеширования

-- Устанавливаем простые пароли для всех пользователей
-- В реальном проекте пароли должны быть более сложными

-- Для суперадмина: admin123
UPDATE user 
SET password = 'admin123'
WHERE login = 'admin' AND role = 'superadmin';

-- Для админа: admin123
UPDATE user 
SET password = 'admin123'
WHERE login = 'admin2' AND role = 'admin';

-- Для обычных пользователей: user123
UPDATE user 
SET password = 'user123'
WHERE role = 'user';

-- Проверяем результат
SELECT 
    user_id,
    login,
    role,
    password
FROM user 
WHERE role IN ('admin', 'superadmin', 'user')
ORDER BY role, user_id; 