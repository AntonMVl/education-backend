import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { Lecture } from '../lecture/entities/lecture.entity';
import { User } from '../user/entities/user.entity';
import { UserProgress } from './entities/userProgress.entity';

@Injectable()
export class UserProgresService {
  constructor(
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
  ) {}

  async getAvailableCourses(userId: number): Promise<any[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }

    const allCourses = await this.courseRepository.find({
      relations: ['lectures'],
      order: { order_number: 'ASC' },
    });

    const userProgress = await this.userProgressRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'lecture'],
    });

    const availableCourses = [];
    let previousCourseCompleted = true;

    for (const course of allCourses) {
      const courseProgress = userProgress.filter(
        (p) => p.course?.id === course.id,
      );
      const completedLectures = courseProgress.filter(
        (p) => p.completed,
      ).length;
      const totalLectures = course.lectures.length;
      const courseCompleted =
        totalLectures > 0 && completedLectures === totalLectures;

      if (previousCourseCompleted) {
        availableCourses.push({
          ...course,
          isAvailable: true,
          progress:
            totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0,
          completed: courseCompleted,
        });
      } else {
        availableCourses.push({
          ...course,
          isAvailable: false,
          progress: 0,
          completed: false,
        });
      }

      previousCourseCompleted = courseCompleted;
    }

    return availableCourses;
  }

  async getCourseProgress(userId: number, courseId: string): Promise<any> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['lectures'],
    });

    if (!course) {
      throw new NotFoundException(`Курс с ID ${courseId} не найден`);
    }

    const userProgress = await this.userProgressRepository.find({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
      relations: ['lecture'],
    });

    const completedLectures = userProgress.filter((p) => p.completed).length;
    const totalLectures = course.lectures.length;
    const progress =
      totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

    return {
      course,
      progress,
      completedLectures,
      totalLectures,
      completed: completedLectures === totalLectures,
    };
  }

  async getOverallProgress(userId: number): Promise<number> {
    const allCourses = await this.courseRepository.find();
    const userProgress = await this.userProgressRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
    });

    let completedCourses = 0;
    for (const course of allCourses) {
      const courseProgress = userProgress.filter(
        (p) => p.course?.id === course.id,
      );
      const completedLectures = courseProgress.filter(
        (p) => p.completed,
      ).length;
      const totalLectures = course.lectures.length;

      if (totalLectures > 0 && completedLectures === totalLectures) {
        completedCourses++;
      }
    }

    return allCourses.length > 0
      ? (completedCourses / allCourses.length) * 100
      : 0;
  }

  async completeLecture(
    userId: number,
    lectureId: string,
    score?: number,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['course'],
    });

    if (!user || !lecture) {
      throw new NotFoundException('Пользователь или лекция не найдены');
    }

    let progress = await this.userProgressRepository.findOne({
      where: {
        user: { id: userId },
        lecture: { id: lectureId },
      },
    });

    if (!progress) {
      progress = this.userProgressRepository.create({
        user,
        lecture,
        course: lecture.course,
        completed: true,
        score,
        completed_at: new Date(),
      });
    } else {
      progress.completed = true;
      progress.score = score;
      progress.completed_at = new Date();
    }

    await this.userProgressRepository.save(progress);
  }

  async isLectureAvailable(
    userId: number,
    lectureId: string,
  ): Promise<boolean> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['course'],
    });

    if (!lecture) {
      return false;
    }

    // Проверяем, доступен ли курс
    const availableCourses = await this.getAvailableCourses(userId);
    const courseAvailable = availableCourses.find(
      (c) => c.id === lecture.course.id,
    )?.isAvailable;

    if (!courseAvailable) {
      return false;
    }

    // Проверяем, завершены ли предыдущие лекции
    const previousLectures = await this.lectureRepository.find({
      where: { course: { id: lecture.course.id } },
      order: { created_at: 'ASC' },
    });

    const currentLectureIndex = previousLectures.findIndex(
      (l) => l.id === lectureId,
    );

    if (currentLectureIndex === 0) {
      return true; // Первая лекция всегда доступна
    }

    // Проверяем завершение предыдущих лекций
    for (let i = 0; i < currentLectureIndex; i++) {
      const previousLecture = previousLectures[i];
      const progress = await this.userProgressRepository.findOne({
        where: {
          user: { id: userId },
          lecture: { id: previousLecture.id },
        },
      });

      if (!progress || !progress.completed) {
        return false;
      }
    }

    return true;
  }
}
