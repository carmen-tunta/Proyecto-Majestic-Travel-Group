import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AppModuleEntity } from './module.entity';
import { UserPermission } from './userPermission.entity';

@Entity('module_actions')
export class ModuleAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AppModuleEntity, m => m.actions, { onDelete: 'CASCADE' })
  module: AppModuleEntity;

  @Column({ type: 'varchar', length: 100 })
  action: string; // e.g. VIEW, CREATE, EDIT, DELETE, ASSIGN, EXPORT

  @Column({ type: 'varchar', length: 150 })
  label: string; // Human readable label

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => UserPermission, up => up.action)
  userPermissions: UserPermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
