import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Service } from './service.entity';
import { Component } from '../../components/entities/component.entity';

@Entity('service_components')
@Index(['servicesId', 'componentsId']) // Índice compuesto para búsquedas rápidas
export class ServiceComponent {
  @PrimaryGeneratedColumn({ comment: 'ID autoincremental para permitir duplicados' })
  id: number;

  @Column({ comment: 'ID del servicio' })
  servicesId: number;

  @Column({ comment: 'ID del componente' })
  componentsId: number;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'servicesId' })
  service: Service;

  @ManyToOne(() => Component, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'componentsId' })
  component: Component;
}
