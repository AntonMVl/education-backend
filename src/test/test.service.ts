import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../answer/entities/answer.entity';
import { Lecture } from '../lecture/entities/lecture.entity';
import { Question } from '../question/entities/question.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
  ) {}

  async getRandomQuestions(
    lectureId: string,
    count: number = 10,
  ): Promise<Question[]> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
    });

    if (!lecture) {
      throw new NotFoundException(`Лекция с ID ${lectureId} не найдена`);
    }

    const questions = await this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.answers', 'answers')
      .where('question.lecture.id = :lectureId', { lectureId })
      .getMany();

    // Перемешиваем вопросы и берем первые count
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, questions.length));
  }

  async checkAnswers(
    lectureId: string,
    answers: Array<{ questionId: string; answerId: string }>,
  ): Promise<{ passed: boolean; score: number; totalQuestions: number }> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
    });

    if (!lecture) {
      throw new NotFoundException(`Лекция с ID ${lectureId} не найдена`);
    }

    let correctAnswers = 0;
    const totalQuestions = answers.length;

    for (const answer of answers) {
      const questionId = parseInt(answer.questionId, 10);
      if (isNaN(questionId)) {
        continue;
      }

      const question = await this.questionRepository.findOne({
        where: { id: questionId },
        relations: ['answers'],
      });

      if (!question) {
        continue;
      }

      const answerId = parseInt(answer.answerId, 10);
      if (isNaN(answerId)) {
        continue;
      }

      const selectedAnswer = question.answers.find(
        (a) => a.id === answerId,
      );
      if (selectedAnswer && selectedAnswer.is_correct) {
        correctAnswers++;
      }
    }

    const passed = correctAnswers === totalQuestions && totalQuestions > 0;
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      passed,
      score,
      totalQuestions,
    };
  }
}
