-- Проверка всех пользователей в базе данных
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
ORDER BY role, user_id; 