import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
