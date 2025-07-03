import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return await this.courseRepository.find({
      relations: ['images', 'lectures'],
      order: { order_number: 'ASC' },
    });
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
}
