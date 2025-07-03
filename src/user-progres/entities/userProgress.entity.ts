import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';
import { User } from '../../user/entities/user.entity';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn({ name: 'userProgress_id' })
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE', nullable: true })
  course: Course;

  @ManyToOne(() => Lecture, { onDelete: 'CASCADE', nullable: true })
  lecture: Lecture;

  @Column('boolean')
  completed: boolean;

  @Column('int', { nullable: true })
  score: number;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
