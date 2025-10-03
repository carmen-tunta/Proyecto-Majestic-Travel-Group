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


  @Column({ type: 'text', comment: 'Título de la portada', nullable: true })
  tituloIzquierda: string;

  @Column({ type: 'longtext', comment: 'Imagen de titulo izquierda', nullable: true })
  imagenIzquierda: string;

  @Column({ type: 'longtext', comment: 'Contenido de la portada', nullable: true })
  contenidoIzquierda: string;

  @Column({ type: 'longtext', comment: 'Imagen pequeña debajo del contenido de titulo izquierda', nullable: true })
  imagenPequeniaIzquierda: string;


  @Column({ type: 'text', comment: 'Título de la portada', nullable: true })
  tituloDerecha: string;

  @Column({ type: 'longtext', comment: 'Imagen de titulo derecha', nullable: true })
  imagenDerecha: string;

  @Column({ type: 'longtext', comment: 'Contenido de la portada', nullable: true })
  contenidoDerecha: string;

  @Column({ type: 'longtext', comment: 'Imagen pequeña debajo del contenido de titulo derecha', nullable: true })
  imagenPequeniaDerecha: string;

  @OneToOne(() => Service, service => service.portada)
  @JoinColumn()
  service: Service;
}