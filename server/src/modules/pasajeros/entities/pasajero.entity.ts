import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Cotizacion } from '../../cotizacion/entities/cotizacion.entity';

@Entity('pasajero')
export class Pasajero {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cotizacion, { nullable: false, onDelete: 'CASCADE' })
  cotizacion: Cotizacion;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  pais: string;

  @Column({ type: 'text' })
  descripcionDocumento: string;

  @Column({ type: 'longtext', nullable: true })
  rutaArchivo?: string;

  @Column({ type: 'longtext', nullable: true })
  nombreArchivo?: string;
}
