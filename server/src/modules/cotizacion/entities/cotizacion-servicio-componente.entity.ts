import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { CotizacionServicio } from './cotizacion-servicio.entity';
import { Component } from '../../components/entities/component.entity';
import { Proveedores } from '../../proveedores/entities/proveedores.entity';

@Entity('cotizacion_servicio_componente')
export class CotizacionServicioComponente {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CotizacionServicio, (cs) => cs.componentes, { nullable: false, onDelete: 'CASCADE' })
  cotizacionServicio: CotizacionServicio;

  @ManyToOne(() => Component, { nullable: true, eager: true })
  component: Component | null;

  // Marcar si es un componente extra (no proviene del catálogo base)
  @Column({ type: 'boolean', default: false })
  isExtra: boolean;

  // Nombre libre para componentes extra
  @Column({ type: 'varchar', length: 255, nullable: true })
  nombreExtra?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nota?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio?: number;

  @Column({ type: 'boolean', default: true })
  isShared: boolean;

  // Fecha y hora programada para realizar el componente
  @Column({ type: 'datetime', nullable: true })
  scheduledAt?: Date | null;

  // Proveedor asignado (opcional)
  @ManyToOne(() => Proveedores, { nullable: true, eager: true })
  proveedor?: Proveedores | null;
}
