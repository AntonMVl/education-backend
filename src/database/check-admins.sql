-- Проверка администраторов в базе данных
SELECT 
    user_id as id,
    firstName,
    lastName,
    login,
    role,
    city,
    createdAt,
    createdBy,
    permissions
FROM user 
WHERE role IN ('admin', 'superadmin')
ORDER BY role, user_id; 