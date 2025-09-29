import { Cotizacion } from "src/modules/cotizacion/entities/cotizacion.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('registroPago')
export class RegistroPago {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    monto: number;

    @Column({ type: 'text', nullable: true })
    nota: string;

    @Column({ type: 'number' })
    cotizacionId: number;

    @ManyToOne(() => Cotizacion, cotizacion => cotizacion.registroPagos)
    cotizacion: Cotizacion;
}