import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ModuleAction } from './module-action.entity';

@Entity('app_modules')
export class AppModuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  code: string; // Ej: COTIZACION, SERVICIOS

  @Column({ length: 150 })
  nombre: string; // Nombre amigable

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @OneToMany(() => ModuleAction, a => a.module)
  actions: ModuleAction[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
