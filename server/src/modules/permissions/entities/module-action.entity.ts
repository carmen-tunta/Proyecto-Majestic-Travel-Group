import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AppModuleEntity } from './app-module.entity';
import { UserPermission } from './user-permission.entity';

@Entity('module_actions')
export class ModuleAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AppModuleEntity, m => m.actions, { onDelete: 'CASCADE' })
  module: AppModuleEntity;

  @Column({ length: 60 })
  action: string; // VIEW, CREATE, EDIT, DELETE, EXPORT, ASSIGN...

  @Column({ length: 120 })
  label: string; // Etiqueta amigable (Ver, Crear, Editar...)

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @OneToMany(() => UserPermission, up => up.action)
  userPermissions: UserPermission[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
