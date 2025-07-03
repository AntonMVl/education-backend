import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Answer } from '../answer/entities/answer.entity';
import { Course } from '../course/entities/course.entity';
import { Image } from '../image/entities/image.entity';
import { Question } from '../question/entities/question.entity';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Lecture } from './entities/lecture.entity';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async create(createLectureDto: CreateLectureDto): Promise<Lecture> {
    const course = await this.courseRepository.findOne({
      where: { id: createLectureDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Курс с ID ${createLectureDto.courseId} не найден`,
      );
    }

    const lecture = this.lectureRepository.create({
      title: createLectureDto.title,
      content: createLectureDto.content,
      pdf_file: createLectureDto.pdf_file,
      has_test: createLectureDto.has_test || false,
      course,
    });

    return this.lectureRepository.save(lecture);
  }

  async findAll(): Promise<Lecture[]> {
    return this.lectureRepository.find({
      relations: ['course', 'images'],
      order: { created_at: 'ASC' },
    });
  }

  async findByCourse(courseId: string): Promise<Lecture[]> {
    return this.lectureRepository.find({
      where: { course: { id: courseId } },
      relations: ['images'],
      order: { created_at: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lecture> {
    const lecture = await this.lectureRepository.findOne({
      where: { id },
      relations: ['course', 'images'],
    });

    if (!lecture) {
      throw new NotFoundException(`Лекция с ID ${id} не найдена`);
    }

    return lecture;
  }

  async update(
    id: string,
    updateLectureDto: UpdateLectureDto,
  ): Promise<Lecture> {
    const lecture = await this.findOne(id);

    if (updateLectureDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updateLectureDto.courseId },
      });

      if (!course) {
        throw new NotFoundException(
          `Курс с ID ${updateLectureDto.courseId} не найден`,
        );
      }

      lecture.course = course;
    }

    if (updateLectureDto.title) {
      lecture.title = updateLectureDto.title;
    }

    if (updateLectureDto.content) {
      lecture.content = updateLectureDto.content;
    }

    if (updateLectureDto.pdf_file) {
      lecture.pdf_file = updateLectureDto.pdf_file;
    }

    if (updateLectureDto.has_test !== undefined) {
      lecture.has_test = updateLectureDto.has_test;
    }

    return this.lectureRepository.save(lecture);
  }

  async remove(id: string): Promise<void> {
    const lecture = await this.findOne(id);
    
    // Получаем все вопросы лекции
    const questions = await this.questionRepository.find({
      where: { lecture: { id } },
      relations: ['answers'],
    });
    
    // Удаляем все ответы для каждого вопроса
    for (const question of questions) {
      await this.answerRepository.delete({ question: { id: question.id } });
    }
    
    // Удаляем все вопросы лекции
    await this.questionRepository.delete({ lecture: { id } });
    
    // Получаем и удаляем все изображения лекции
    const images = await this.imageRepository.find({
      where: { lecture: { id } },
    });
    
    // Удаляем физические файлы изображений
    for (const image of images) {
      try {
        const imagePath = path.join(process.cwd(), 'uploads', 'lectures', path.basename(image.file_path));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Изображение удалено: ${imagePath}`);
        }
      } catch (error) {
        console.error('Ошибка при удалении изображения:', error);
        // Не прерываем удаление лекции, если не удалось удалить файл
      }
    }
    
    // Удаляем записи изображений из базы данных
    await this.imageRepository.delete({ lecture: { id } });
    
    // Удаляем PDF файл, если он существует
    if (lecture.pdf_file) {
      try {
        const pdfPath = path.join(process.cwd(), 'uploads', 'lectures', path.basename(lecture.pdf_file));
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
          console.log(`PDF файл удален: ${pdfPath}`);
        }
      } catch (error) {
        console.error('Ошибка при удалении PDF файла:', error);
        // Не прерываем удаление лекции, если не удалось удалить файл
      }
    }
    
    // Наконец удаляем саму лекцию
    await this.lectureRepository.remove(lecture);
  }

  async addPdf(id: string, pdfPath: string): Promise<Lecture> {
    const lecture = await this.findOne(id);
    lecture.pdf_file = pdfPath;
    return this.lectureRepository.save(lecture);
  }

  async addImage(
    id: string,
    imagePath: string,
    altText?: string,
  ): Promise<Lecture> {
    const lecture = await this.findOne(id);

    const image = this.imageRepository.create({
      file_path: imagePath,
      alt_text: altText,
      lecture,
    });

    await this.imageRepository.save(image);

    return this.findOne(id);
  }

  // Вспомогательный метод для очистки неиспользуемых файлов
  async cleanupOrphanedFiles(): Promise<void> {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'lectures');
      if (!fs.existsSync(uploadsDir)) {
        return;
      }

      const files = fs.readdirSync(uploadsDir);
      
      // Получаем все используемые файлы из базы данных
      const [lectures, images] = await Promise.all([
        this.lectureRepository.find({ select: ['pdf_file'] }),
        this.imageRepository.find({ select: ['file_path'] }),
      ]);

      const usedFiles = new Set<string>();
      
      // Добавляем PDF файлы
      lectures.forEach(lecture => {
        if (lecture.pdf_file) {
          usedFiles.add(path.basename(lecture.pdf_file));
        }
      });
      
      // Добавляем изображения
      images.forEach(image => {
        usedFiles.add(path.basename(image.file_path));
      });

      // Удаляем неиспользуемые файлы
      for (const file of files) {
        if (!usedFiles.has(file)) {
          const filePath = path.join(uploadsDir, file);
          try {
            fs.unlinkSync(filePath);
            console.log(`Удален неиспользуемый файл: ${file}`);
          } catch (error) {
            console.error(`Ошибка при удалении файла ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при очистке файлов:', error);
    }
  }
}
