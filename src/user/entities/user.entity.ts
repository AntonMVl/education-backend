import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from '../../enums/permissions.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  login: string;

  @Column()
  role: string;

  @Column()
  city: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column('simple-array', { nullable: true })
  permissions: Permission[];
}
