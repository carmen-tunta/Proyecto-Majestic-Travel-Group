import { Tarifario } from "src/modules/tarifario/entities/tarifario.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('TarifaIncrement')
export class TarifaIncrement {
   @PrimaryGeneratedColumn()
   id: number;

   @Column({ type: 'int', comment: 'ID de la tarifa asociada' })
   tarifaId: number;

   @Column({ type: 'date', comment: 'Fecha del incremento' })
   incrementDate: Date;

   @Column({ type: 'boolean', comment: 'Porcentual o monetario' })
   percentage: boolean;

   @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Valor del incremento' })
   incrementValue: number;

   @ManyToOne(() => Tarifario, t => t.increments, { onDelete: 'CASCADE' })
   tarifa: Tarifario;

}