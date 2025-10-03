import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { Component } from '../../components/entities/component.entity';
import { ServiceImage } from 'src/modules/serviceImages/entities/serviceImages.entity';
import { Portada } from './portada.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', comment: 'Nombre del servicio' })
  name: string;

  @Column({ type: 'text', comment: 'Ciudad del servicio' })
  city: string;

  @Column({ default: true, comment: 'Estado activo/inactivo del servicio' })
  isActive: boolean;

  @ManyToMany(() => Component, (component) => component.services, { cascade: false })
  @JoinTable({ name: 'service_components' })
  components: Component[];

  @OneToMany(() => ServiceImage, image => image.service, { cascade: true })
  images: ServiceImage[];

  @OneToOne(() => Portada, portada => portada.service, { 
    cascade: true,
    nullable: true
  })
  portada: Portada;
}