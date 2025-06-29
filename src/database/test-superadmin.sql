-- Проверка суперадмина
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
WHERE login = 'AMorohin' OR role = 'superadmin';

-- Если суперадмин не найден, создаем его
INSERT INTO user (firstName, lastName, login, role, city, password, createdAt)
SELECT 
    'Антон',
    'Морохин', 
    'AMorohin',
    'superadmin',
    'Сыктывкар',
    'admin123',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM user WHERE login = 'AMorohin'
);

-- Проверяем результат
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