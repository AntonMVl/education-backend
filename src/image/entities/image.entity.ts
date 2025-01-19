import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lecture } from '../../lecture/entities/lecture.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lecture, (lecture) => lecture.images, {
    onDelete: 'CASCADE',
  })
  lecture: Lecture;

  @Column()
  file_path: string; // Путь к файлу на сервере

  @Column({ nullable: true })
  alt_text: string; // Альтернативный текст (опционально)

  @CreateDateColumn()
  created_at: Date;
}
