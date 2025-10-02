import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ModuleAction } from './moduleAction.entity';

@Entity('user_permissions')
@Unique(['user', 'action'])
export class UserPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => ModuleAction, a => a.userPermissions, { eager: true, onDelete: 'CASCADE' })
  action: ModuleAction;

  @CreateDateColumn()
  grantedAt: Date;
}
