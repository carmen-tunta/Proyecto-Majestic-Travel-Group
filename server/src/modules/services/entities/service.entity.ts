import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Component } from '../../components/entities/component.entity';
import { ServiceImage } from 'src/modules/serviceImages/entities/serviceImages.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: 'Nombre del servicio' })
  name: string;

  @Column({ length: 50, comment: 'Ciudad del servicio' })
  city: string;

  // @Column({ type: 'json', nullable: true, comment: 'Galería de imágenes del servicio' })
  // images: string[];

  @Column({ default: true, comment: 'Estado activo/inactivo del servicio' })
  isActive: boolean;

  @OneToMany(() => Component, (component) => component.service)
  components: Component[];

  @OneToMany(() => ServiceImage, image => image.service, { cascade: true })
  images: ServiceImage[];
}