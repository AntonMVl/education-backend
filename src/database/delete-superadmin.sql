-- Удаление суперадминистратора из базы данных
-- Удаляет пользователей с ролью 'SuperAdmin' (с заглавными буквами)

-- Сначала удаляем права, связанные с суперадмином
DELETE FROM admin_permissions WHERE granted_by IN (
    SELECT id FROM users WHERE role = 'SuperAdmin'
);

-- Затем удаляем права самого суперадмина
DELETE FROM admin_permissions WHERE admin_id IN (
    SELECT id FROM users WHERE role = 'SuperAdmin'
);

-- Удаляем суперадминистратора
DELETE FROM users WHERE role = 'SuperAdmin';

-- Проверяем результат
SELECT 'Оставшиеся пользователи:' as info;
SELECT id, login, firstName, lastName, role FROM users ORDER BY role, id; 