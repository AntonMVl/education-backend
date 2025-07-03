import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn({ name: 'image_id' })
  id: string;

  @ManyToOne(() => Lecture, (lecture) => lecture.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  lecture: Lecture;

  @ManyToOne(() => Course, (course) => course.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  course: Course;

  @Column()
  file_path: string;

  @Column({ nullable: true })
  alt_text: string;

  @CreateDateColumn()
  created_at: Date;
}
