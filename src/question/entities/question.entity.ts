import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from '../../answer/entities/answer.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn({ name: 'question_id' })
  id: number;

  @Column('text')
  text: string;

  @ManyToOne(() => Lecture, (lecture) => lecture.questions)
  lecture: Lecture;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
