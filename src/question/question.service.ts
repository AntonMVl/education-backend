import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../answer/entities/answer.entity';
import { Lecture } from '../lecture/entities/lecture.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: createQuestionDto.lectureId },
    });

    if (!lecture) {
      throw new NotFoundException(
        `Лекция с ID ${createQuestionDto.lectureId} не найдена`,
      );
    }

    const question = this.questionRepository.create({
      text: createQuestionDto.text,
      lecture,
    });

    const savedQuestion = await this.questionRepository.save(question);

    // Создаем ответы
    const answers = createQuestionDto.answers.map((answerDto) =>
      this.answerRepository.create({
        text: answerDto.text,
        is_correct: answerDto.isCorrect,
        question: savedQuestion,
      }),
    );

    await this.answerRepository.save(answers);

    return this.findOne(savedQuestion.id);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({
      relations: ['lecture', 'answers'],
    });
  }

  async findByLecture(lectureId: string): Promise<Question[]> {
    return this.questionRepository.find({
      where: { lecture: { id: lectureId } },
      relations: ['answers'],
    });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['lecture', 'answers'],
    });

    if (!question) {
      throw new NotFoundException(`Вопрос с ID ${id} не найден`);
    }

    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.findOne(id);

    if (updateQuestionDto.lectureId) {
      const lecture = await this.lectureRepository.findOne({
        where: { id: updateQuestionDto.lectureId },
      });

      if (!lecture) {
        throw new NotFoundException(
          `Лекция с ID ${updateQuestionDto.lectureId} не найдена`,
        );
      }

      question.lecture = lecture;
    }

    if (updateQuestionDto.text) {
      question.text = updateQuestionDto.text;
    }

    await this.questionRepository.save(question);

    // Обновляем ответы, если они предоставлены
    if (updateQuestionDto.answers) {
      // Удаляем старые ответы
      await this.answerRepository.delete({ question: { id } });

      // Создаем новые ответы
      const answers = updateQuestionDto.answers.map((answerDto) =>
        this.answerRepository.create({
          text: answerDto.text,
          is_correct: answerDto.isCorrect,
          question,
        }),
      );

      await this.answerRepository.save(answers);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    await this.questionRepository.remove(question);
  }
}
