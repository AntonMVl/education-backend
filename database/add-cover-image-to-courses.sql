-- Добавление поля cover_image в таблицу courses
ALTER TABLE courses ADD COLUMN cover_image VARCHAR(255);

-- Комментарий к полю
COMMENT ON COLUMN courses.cover_image IS 'Путь к файлу обложки курса'; 