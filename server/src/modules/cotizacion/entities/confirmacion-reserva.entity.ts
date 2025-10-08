import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Cotizacion } from './cotizacion.entity';

@Entity('confirmacion_reserva')
export class ConfirmacionReserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'ID de la cotización asociada' })
  cotizacionId: number;

  @Column({ type: 'text', comment: 'Nombre del cliente', nullable: true })
  nombreCliente: string;

  @Column({ type: 'text', comment: 'Nombre de la agencia', nullable: true })
  agencia: string;

  @Column({ type: 'date', comment: 'Fecha de viaje', nullable: true })
  fechaViaje: Date;

  @Column({ type: 'int', comment: 'Número de pasajeros', nullable: true, default: 1 })
  numeroPasajeros: number;

  @Column({ type: 'text', comment: 'Nombre del responsable de booking', nullable: true })
  bookingPor: string;

  @Column({ type: 'text', comment: 'Número de WhatsApp de contacto', nullable: true })
  whatsapp: string;

  @Column({ type: 'text', comment: 'Correo electrónico de contacto', nullable: true })
  correo: string;

  @Column({ type: 'longtext', comment: 'Imagen del logo/header', nullable: true })
  imagenLogo: string;

  @Column({ type: 'text', comment: 'Título de la confirmación', nullable: true })
  titulo: string;

  @Column({ type: 'text', comment: 'Estado del booking', nullable: true, default: 'Confirmado' })
  estadoBooking: string;

  @Column({ type: 'text', comment: 'Dirección de la empresa', nullable: true })
  direccion: string;

  @Column({ type: 'text', comment: 'Teléfono de contacto adicional', nullable: true })
  telefono: string;

  @Column({ type: 'boolean', default: false, comment: 'Indica si la confirmación está eliminada lógicamente' })
  isDeleted: boolean;

  @OneToOne(() => Cotizacion)
  @JoinColumn()
  cotizacion: Cotizacion;
}

