# Функционал работы с PDF файлами

## Описание

В образовательном приложении реализован полный функционал для работы с PDF-лекциями:

- **Админы** могут загружать PDF-файлы при создании/редактировании лекций
- **Пользователи** могут просматривать PDF прямо в приложении и скачивать файлы

## Архитектура

### Бэкенд (NestJS)

#### 1. Настройка статической раздачи файлов
```typescript
// main.ts
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

#### 2. Контроллер для загрузки PDF
```typescript
// lecture.controller.ts
@Post(':id/pdf')
@UseInterceptors(
  FileInterceptor('pdf', {
    storage: diskStorage({
      destination: './uploads/lectures',
      filename: (req, file, cb) => {
        const uniqueName = uuidv4();
        const extension = extname(file.originalname);
        cb(null, `${uniqueName}${extension}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new BadRequestException('Только PDF файлы разрешены'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }),
)
async addPdf(@Param('id') id: string, @UploadedFile() file: any) {
  // Логика сохранения пути к PDF
}
```

#### 3. Сервис для работы с PDF
```typescript
// lecture.service.ts
async addPdf(id: string, pdfPath: string): Promise<Lecture> {
  const lecture = await this.findOne(id);
  lecture.pdf_file = pdfPath;
  return this.lectureRepository.save(lecture);
}
```

### Фронтенд (React)

#### 1. API для работы с PDF
```typescript
// lecturesApi.ts
export const createLecture = async (lectureData: CreateLectureData, pdfFile?: File) => {
  // Сначала создаем лекцию
  const lecture = await fetch(`${apiUrl}/lecture`, { ... });
  
  // Затем загружаем PDF, если есть
  if (pdfFile && lecture.id) {
    await uploadLecturePdf(lecture.id, pdfFile);
  }
  
  return lecture;
};

export const uploadLecturePdf = async (lectureId: string, file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  return fetch(`${apiUrl}/lecture/${lectureId}/pdf`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
};
```

#### 2. Модальное окно создания лекции
```typescript
// LectureModal.tsx
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type === 'application/pdf') {
    setSelectedFile(file);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  // Создание/обновление лекции с PDF
  await createLecture(formData, selectedFile || undefined);
};
```

#### 3. Просмотр PDF в лекции
```typescript
// LectureStudy.tsx
const handleDownloadPDF = () => {
  if (lecture?.pdf_file) {
    const fullUrl = `http://localhost:3001${lecture.pdf_file}`;
    window.open(fullUrl, '_blank');
  }
};

// В JSX
{lecture.pdf_file && (
  <div className={styles.pdfContainer}>
    <iframe
      src={`http://localhost:3001${lecture.pdf_file}`}
      title="PDF лекции"
      className={styles.pdfViewer}
    />
    <button onClick={handleDownloadPDF}>
      📥 Скачать PDF
    </button>
  </div>
)}
```

## Структура файлов

```
education-backend/
├── uploads/
│   └── lectures/          # Папка для PDF файлов
├── src/
│   ├── lecture/
│   │   ├── lecture.controller.ts
│   │   ├── lecture.service.ts
│   │   └── entities/
│   │       └── lecture.entity.ts
│   └── main.ts
```

## API Endpoints

### Загрузка PDF
- **POST** `/api/lecture/:id/pdf`
- **Content-Type**: `multipart/form-data`
- **Body**: `pdf` (файл)
- **Response**: Обновленная лекция с путем к PDF

### Получение лекции с PDF
- **GET** `/api/lecture/:id`
- **Response**: Лекция с полем `pdf_file`

### Доступ к PDF файлу
- **GET** `/uploads/lectures/{filename}`
- **Response**: PDF файл

## Безопасность

1. **Валидация файлов**: Проверяется MIME-тип (только PDF)
2. **Ограничение размера**: Максимум 10MB
3. **Уникальные имена**: Используется UUID для предотвращения конфликтов
4. **Авторизация**: Только админы могут загружать PDF

## Использование

### Для админов:
1. Откройте админ панель
2. Перейдите в раздел "Лекции"
3. Создайте новую лекцию или отредактируйте существующую
4. Выберите PDF файл в поле "PDF файл лекции"
5. Сохраните лекцию

### Для пользователей:
1. Откройте курс
2. Выберите лекцию для изучения
3. PDF отобразится прямо в браузере
4. Используйте кнопку "Скачать PDF" для сохранения файла

## Технические детали

- **Хранение**: Файлы сохраняются в папке `uploads/lectures/`
- **Имена файлов**: UUID + расширение (например: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf`)
- **Пути в БД**: Сохраняются как `/uploads/lectures/{filename}`
- **Статическая раздача**: Настроена через `useStaticAssets` в NestJS
- **CORS**: Настроен для доступа к файлам с фронтенда

## Возможные улучшения

1. **Сжатие PDF**: Добавить сжатие больших файлов
2. **Водяные знаки**: Добавить водяные знаки для защиты
3. **Версионирование**: Поддержка разных версий PDF
4. **Предпросмотр**: Генерация превью для PDF
5. **Аналитика**: Отслеживание скачиваний и просмотров 