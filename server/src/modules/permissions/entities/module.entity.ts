import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ModuleAction } from './moduleAction.entity';

@Entity('app_modules')
export class AppModuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 100 })
  code: string; // e.g. COTIZACION, ITINERARIO, USUARIOS

  @Column({ type: 'varchar', length: 150 })
  name: string; // Display name

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => ModuleAction, action => action.module)
  actions: ModuleAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
