import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '../../image/entities/image.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn({ name: 'course_id' })
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('int')
  order_number: number;

  @OneToMany(() => Image, (image) => image.course)
  images: Image[];

  @OneToMany(() => Lecture, (lecture) => lecture.course)
  lectures: Lecture[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
