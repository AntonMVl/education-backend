import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  lecture_id: string;

  @Column('boolean')
  completed: boolean;

  @Column('int', { nullable: true })
  score: number;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
