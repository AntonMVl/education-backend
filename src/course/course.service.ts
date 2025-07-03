import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Image } from '../image/entities/image.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    const courses = await this.courseRepository.find({
      relations: ['images', 'lectures'],
      order: { order_number: 'ASC' },
    });

    // Добавляем количество лекций к каждому курсу
    return courses.map(course => ({
      ...course,
      lecturesCount: course.lectures?.length || 0,
    }));
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'images',
        'lectures',
        'lectures.questions',
        'lectures.questions.answers',
      ],
    });

    if (!course) {
      throw new NotFoundException(`Курс с ID ${id} не найден`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    
    // Получаем все изображения курса
    const images = await this.imageRepository.find({
      where: { course: { id } },
    });
    
    // Удаляем физические файлы изображений
    for (const image of images) {
      try {
        const imagePath = path.join(process.cwd(), 'uploads', 'lectures', path.basename(image.file_path));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Изображение курса удалено: ${imagePath}`);
        }
      } catch (error) {
        console.error('Ошибка при удалении изображения курса:', error);
        // Не прерываем удаление курса, если не удалось удалить файл
      }
    }
    
    // Удаляем обложку курса, если она существует
    if (course.cover_image) {
      try {
        const coverPath = path.join(process.cwd(), 'uploads', 'courses', path.basename(course.cover_image));
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
          console.log(`Обложка курса удалена: ${coverPath}`);
        }
      } catch (error) {
        console.error('Ошибка при удалении обложки курса:', error);
        // Не прерываем удаление курса, если не удалось удалить файл
      }
    }
    
    // Удаляем курс (изображения удалятся автоматически благодаря CASCADE)
    await this.courseRepository.remove(course);
  }

  async addImage(
    courseId: string,
    imagePath: string,
    altText?: string,
  ): Promise<Image> {
    const course = await this.findOne(courseId);
    const image = this.imageRepository.create({
      file_path: imagePath,
      alt_text: altText,
      course,
    });
    return await this.imageRepository.save(image);
  }

  async addCover(courseId: string, coverPath: string): Promise<Course> {
    const course = await this.findOne(courseId);
    course.cover_image = coverPath;
    return await this.courseRepository.save(course);
  }

  async removeCover(courseId: string): Promise<Course> {
    const course = await this.findOne(courseId);
    
    // Удаляем физический файл обложки, если он существует
    if (course.cover_image) {
      try {
        const coverPath = path.join(process.cwd(), 'uploads', 'courses', path.basename(course.cover_image));
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
          console.log(`Обложка курса удалена: ${coverPath}`);
        }
      } catch (error) {
        console.error('Ошибка при удалении обложки курса:', error);
        // Не прерываем удаление, если не удалось удалить файл
      }
    }
    
    // Удаляем ссылку на обложку из базы данных
    course.cover_image = null;
    return await this.courseRepository.save(course);
  }
}
