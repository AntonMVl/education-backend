import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
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

  @Column({ nullable: true })
  pdf_file: string;

  @Column('boolean', { default: false })
  has_test: boolean;

  @ManyToOne(() => Course, (course) => course.lectures)
  course: Course;

  @OneToMany(() => Image, (image) => image.lecture)
  images: Image[];

  @OneToMany(() => Question, (question) => question.lecture)
  questions: Question[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
