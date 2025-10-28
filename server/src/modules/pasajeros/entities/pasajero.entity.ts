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

  @Column({length: 20, comment: 'Número de WhatsApp del pasajero',})
  whatsapp: string;

  @Column({type: 'text', comment: 'Correo electrónico del pasajero',})
  correo: string;

  @Column({type: 'date', comment: 'Fecha de nacimiento del pasajero',})
  fechaNacimiento: Date;

  @Column({type: 'text', comment: 'Nacionalidad del pasajero'})
  nacionalidad: string;

  @Column({type: 'text', comment: 'Tipo de documento del pasajero',})
  tipoDocumento: string;

  @Column({type: 'text', comment: 'Número de documento del pasajero',})
  numeroDocumento: string;

  @Column({type: 'text', comment: 'Género del pasajero',})
  genero: string;

  @Column({ type: 'text' })
  descripcionDocumento: string;

  @Column({ type: 'longtext', nullable: true })
  rutaArchivo?: string;

  @Column({ type: 'longtext', nullable: true })
  nombreArchivo?: string;
}
