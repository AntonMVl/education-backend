import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Lecture } from '../lecture/entities/lecture.entity';
import { User } from '../user/entities/user.entity';
import { UserProgress } from './entities/userProgress.entity';
import { UserProgresController } from './user-progres.controller';
import { UserProgresService } from './user-progres.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProgress, User, Course, Lecture])],
  controllers: [UserProgresController],
  providers: [UserProgresService],
  exports: [UserProgresService],
})
export class UserProgresModule {}
