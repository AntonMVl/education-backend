import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from '../../enums/permissions.enum';
import { User } from '../../user/entities/user.entity';

@Entity('admin_permissions')
export class AdminPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  adminId: number;

  @Column({
    type: 'enum',
    enum: Permission,
  })
  permission: Permission;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  grantedAt: Date;

  @Column({ nullable: true })
  grantedBy: number; // ID суперадмина, который выдал право

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'grantedBy' })
  granter: User;
}
