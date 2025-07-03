import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../answer/entities/answer.entity';
import { Lecture } from '../lecture/entities/lecture.entity';
import { Question } from '../question/entities/question.entity';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer, Lecture])],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
