-- Создание таблицы курсов
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы лекций
CREATE TABLE IF NOT EXISTS lectures (
    lecture_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    pdf_file VARCHAR(500),
    has_test BOOLEAN DEFAULT FALSE,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы вопросов
CREATE TABLE IF NOT EXISTS questions (
    question_id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    lecture_id INTEGER REFERENCES lectures(lecture_id) ON DELETE CASCADE
);

-- Создание таблицы ответов
CREATE TABLE IF NOT EXISTS answers (
    answer_id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Создание таблицы изображений
CREATE TABLE IF NOT EXISTS images (
    image_id SERIAL PRIMARY KEY,
    file_path VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    lecture_id INTEGER REFERENCES lectures(lecture_id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обновление таблицы прогресса пользователей
DROP TABLE IF EXISTS user_progress;
CREATE TABLE user_progress (
    userProgress_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
    lecture_id INTEGER REFERENCES lectures(lecture_id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    completed_at TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX idx_courses_order ON courses(order_number);
CREATE INDEX idx_lectures_course ON lectures(course_id);
CREATE INDEX idx_questions_lecture ON questions(lecture_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_images_lecture ON images(lecture_id);
CREATE INDEX idx_images_course ON images(course_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_course ON user_progress(course_id);
CREATE INDEX idx_user_progress_lecture ON user_progress(lecture_id);

-- Добавление прав для управления курсами и лекциями
INSERT INTO permissions (name, description) VALUES 
('MANAGE_COURSES', 'Управление курсами'),
('MANAGE_LECTURES', 'Управление лекциями'),
('MANAGE_TESTS', 'Управление тестами')
ON CONFLICT (name) DO NOTHING;

-- Предоставление всех прав суперадмину
INSERT INTO admin_permissions (admin_id, permission_id)
SELECT 
    u.id as admin_id,
    p.id as permission_id
FROM users u
CROSS JOIN permissions p
WHERE u.role = 'superadmin' 
AND p.name IN ('MANAGE_COURSES', 'MANAGE_LECTURES', 'MANAGE_TESTS')
ON CONFLICT (admin_id, permission_id) DO NOTHING; 