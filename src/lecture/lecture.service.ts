import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { Image } from '../image/entities/image.entity';
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
}
