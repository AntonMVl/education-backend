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

    return this.findOne(savedQuestion.id.toString());
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({
      relations: ['lecture', 'lecture.course', 'answers'],
    });
  }

  async findByLecture(lectureId: string): Promise<Question[]> {
    return this.questionRepository.find({
      where: { lecture: { id: lectureId } },
      relations: ['lecture', 'lecture.course', 'answers'],
    });
  }

  async findOne(id: string): Promise<Question> {
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      throw new NotFoundException(`Неверный ID вопроса: ${id}`);
    }

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
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
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      throw new NotFoundException(`Неверный ID вопроса: ${id}`);
    }

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['lecture', 'answers'],
    });

    if (!question) {
      throw new NotFoundException(`Вопрос с ID ${id} не найден`);
    }

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
      await this.answerRepository.delete({ question: { id: questionId } });

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
    console.log(`Попытка удаления вопроса с ID: ${id}`)
    
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      throw new NotFoundException(`Неверный ID вопроса: ${id}`);
    }
    
    // Проверяем существование вопроса
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      console.log(`Вопрос с ID ${id} не найден в базе данных`)
      throw new NotFoundException(`Вопрос с ID ${id} не найден`);
    }

    console.log(`Найден вопрос: ${question.text}`)
    
    // Удаляем связанные ответы
    await this.answerRepository.delete({ question: { id: questionId } });
    console.log(`Удалены ответы для вопроса ${id}`)
    
    // Удаляем сам вопрос
    await this.questionRepository.remove(question);
    console.log(`Вопрос ${id} успешно удален`)
  }
}
