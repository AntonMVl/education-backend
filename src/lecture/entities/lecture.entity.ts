import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '../../image/entities/image.entity';
import { Question } from '../../question/entities/question.entity';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn({ name: 'lecture_id' })
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @OneToMany(() => Image, (image) => image.lecture)
  images: Image[];

  @OneToMany(() => Question, (question) => question.lecture)
  questions: Question[];

  @CreateDateColumn()
  created_at: Date;
}
