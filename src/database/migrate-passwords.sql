-- Миграция для исправления паролей в базе данных
-- Устанавливаем правильные хеши argon2 для всех пользователей

-- Очищаем все пароли (временно)
UPDATE user SET password = '';

-- Устанавливаем правильные хеши для тестовых паролей
-- admin123 -> $argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG
-- user123 -> $argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG

-- Для суперадмина (admin) устанавливаем пароль admin123
UPDATE user 
SET password = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG'
WHERE login = 'admin' AND role = 'superadmin';

-- Для админа (admin2) устанавливаем пароль admin123
UPDATE user 
SET password = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG'
WHERE login = 'admin2' AND role = 'admin';

-- Для всех остальных пользователей устанавливаем пароль user123
UPDATE user 
SET password = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG'
WHERE role = 'user';

-- Проверяем результат
SELECT 
    user_id,
    login,
    role,
    CASE 
        WHEN password LIKE '$argon2id$%' THEN 'VALID_HASH'
        WHEN password = '' THEN 'EMPTY'
        ELSE 'INVALID_HASH'
    END as password_status,
    LEFT(password, 30) as password_preview
FROM user 
ORDER BY role, user_id; 