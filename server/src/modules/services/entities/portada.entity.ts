import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Service } from './service.entity';

@Entity('Portada')
export class Portada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'ID del servicio asociado' })
  serviceId: number;

  @Column({ type: 'text', comment: 'Título de la portada', nullable: true })
  titulo: string;

  @Column({ type: 'longtext', comment: 'Imagen de la portada', nullable: true })
  imagenCentro: string;

  @OneToOne(() => Service, service => service.portada)
  @JoinColumn()
  service: Service;
}