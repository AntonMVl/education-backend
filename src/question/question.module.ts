import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../answer/entities/answer.entity';
import { Lecture } from '../lecture/entities/lecture.entity';
import { Question } from './entities/question.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer, Lecture])],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
