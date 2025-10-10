import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Cotizacion } from './cotizacion.entity';


@Entity('datosViaje')
export class DatosViaje {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', comment: 'Id cotizacion' })
    cotizacionId: number;

    @Column({  type: 'date', comment: 'Fecha de llegada' })
    fechaLlegada: Date;

    @Column({ type: 'date', comment: 'Fecha de salida' })
    fechaSalida: Date;

    @Column({type: 'int', comment: 'Cantidad de adultos', default: 0 })
    adultos: number;

    @Column({type: 'int', comment: 'Cantidad de niños', default: 0 })
    ninos: number;

    @Column({type: 'int', comment: 'Cantidad de bebés', default: 0 })
    bebes: number;

    @Column({ type: 'text', comment: 'Lugar de recojo' })
    lugarRecojo: string;

    @Column({ type: 'text', comment: 'Comentario o nota', nullable: true })
    comentario: string;

    @OneToOne(() => Cotizacion, cotizacion => cotizacion.datosViaje)
    @JoinColumn()
    cotizacion: Cotizacion;
}