import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { RegistroPago } from 'src/modules/registroPago/entities/registroPago.entity';
import { User } from '../../users/entities/user.entity';
import { Pasajero } from '../../pasajeros/entities/pasajero.entity';
import { DatosViaje } from './datos-viaje.entity';

@Entity('cotizacion')
export class Cotizacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { nullable: false, eager: true })
  cliente: Client;

  @ManyToOne(() => User, { nullable: true, eager: true })
  creadoPor: User;

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

  @Column({ type: 'date', nullable: true })
  fechaLlegada: Date;

  @Column({ type: 'date', nullable: true })
  fechaSalida: Date;

  @Column({ type: 'enum', enum: ['Iniciado', 'Proceso', 'Cotización enviada', 'Finalizado'] })
  estado: string;

  @Column({ type: 'enum', enum: ['Viator', 'Civitatis', 'GetYourGuide', 'TourRadar', 'TripAdvisor', 'Peru Hop', 'Inca Rail', 'PeruRail', 'Lima Tours', 'Condor Travel'] })
  agencia: string;

  @Column({ type: 'text' })
  pais: string;

  @Column({ type: 'text' })
  idioma: string;

  @Column({ type: 'int', default: 1 })
  nroPax: number;

  @Column({ type: 'int', default: 0 })
  nroNinos: number;

  @Column({ type: 'int', default: 0 })
  nroBebes: number;

  @Column({ type: 'text', nullable: true })
  lugarRecojo: string;

  @Column({ type: 'text', nullable: true })
  comentario: string;

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  adelanto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldo: number;

  @OneToMany(() => RegistroPago, (registroPago) => registroPago.cotizacion, { cascade: true })
  registroPagos: RegistroPago[];

  @OneToMany(() => Pasajero, (pasajero) => pasajero.cotizacion, { cascade: true })
  pasajeros: Pasajero[];

  @OneToOne(() => DatosViaje, datosViaje => datosViaje.cotizacion, {
      cascade: true,
      nullable: true
    })
    datosViaje: DatosViaje;

}
