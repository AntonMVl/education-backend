import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Image } from '../image/entities/image.entity';
import { Lecture } from './entities/lecture.entity';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lecture, Course, Image])],
  controllers: [LectureController],
  providers: [LectureService],
  exports: [LectureService],
})
export class LectureModule {}
