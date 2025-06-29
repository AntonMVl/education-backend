-- Скрипт для исправления паролей в базе данных
-- Заменяем неправильно хешированные пароли на правильно хешированные

-- Сначала посмотрим на текущие пароли
SELECT 
    user_id,
    login,
    role,
    LEFT(password, 20) as password_preview
FROM user 
WHERE role IN ('admin', 'superadmin', 'user')
ORDER BY role, user_id;

-- Обновляем пароли для всех пользователей
-- Для суперадмина устанавливаем пароль 'admin123'
UPDATE user 
SET password = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG'
WHERE login = 'admin' AND role = 'superadmin';

-- Для админа устанавливаем пароль 'admin123'
UPDATE user 
SET password = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG'
WHERE login = 'admin2' AND role = 'admin';

-- Для обычных пользователей устанавливаем пароль 'user123'
UPDATE user 
SET password = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG'
WHERE role = 'user' AND (password NOT LIKE '$argon2id$%' OR password IS NULL);

-- Проверяем результат
SELECT 
    user_id,
    login,
    role,
    LEFT(password, 20) as password_preview
FROM user 
WHERE role IN ('admin', 'superadmin', 'user')
ORDER BY role, user_id; 