import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('cotizacion')
export class Cotizacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { nullable: false, eager: true })
  cliente: Client;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombreCotizacion: string;

  @Column({ type: 'enum', enum: ['Privado', 'Compartido', 'Priv'] })
  categoria: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  utilidad: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigoReserva: string;

  @Column({ type: 'date' })
  fechaViaje: Date;

  @Column({ type: 'enum', enum: ['Iniciado', 'Proceso', 'Finalizado'] })
  estado: string;

  @Column({ type: 'enum', enum: ['Viator', 'Civitatis', 'GetYourGuide', 'TourRadar', 'TripAdvisor', 'Peru Hop', 'Inca Rail', 'PeruRail', 'Lima Tours', 'Condor Travel'] })
  agencia: string;

  @Column({ type: 'enum', enum: ['Perú', 'Bolivia', 'Chile', 'Argentina', 'Brasil', 'Ecuador', 'Colombia', 'España', 'Estados Unidos', 'Francia'] })
  pais: string;

  @Column({ type: 'enum', enum: ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano'] })
  idioma: string;

  @Column({ type: 'int', default: 1 })
  nroPax: number;

  @Column({ type: 'int', default: 0 })
  nroNinos: number;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'int' })
  numeroFile: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costo: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioUtilidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioVenta: number;

}
