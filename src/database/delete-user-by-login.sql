-- Удаление конкретного пользователя по логину
-- Замените 'your_login' на логин пользователя, которого нужно удалить

-- Сначала удаляем права, связанные с пользователем
DELETE FROM admin_permissions WHERE granted_by IN (
    SELECT id FROM users WHERE login = 'your_login'
);

-- Затем удаляем права самого пользователя
DELETE FROM admin_permissions WHERE admin_id IN (
    SELECT id FROM users WHERE login = 'your_login'
);

-- Удаляем пользователя
DELETE FROM users WHERE login = 'your_login';

-- Проверяем результат
SELECT 'Оставшиеся пользователи:' as info;
SELECT id, login, firstName, lastName, role FROM users ORDER BY role, id; 