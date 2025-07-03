import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from '../../question/entities/question.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn({ name: 'answer_id' })
  id: number;

  @Column('text')
  text: string;

  @Column('boolean')
  is_correct: boolean;

  @ManyToOne(() => Question, (question) => question.answers, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  question: Question;
}
