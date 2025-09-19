import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column } from 'typeorm';
import { Cotizacion } from './cotizacion.entity';
import { Service } from '../../services/entities/service.entity';
import { CotizacionServicioComponente } from './cotizacion-servicio-componente.entity';

@Entity('cotizacion_servicio')
export class CotizacionServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cotizacion, { nullable: false, onDelete: 'CASCADE' })
  cotizacion: Cotizacion;

  @ManyToOne(() => Service, { nullable: false, eager: true })
  service: Service;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio?: number;

  @OneToMany(() => CotizacionServicioComponente, (csc) => csc.cotizacionServicio, { cascade: true, eager: true })
  componentes: CotizacionServicioComponente[];
}
