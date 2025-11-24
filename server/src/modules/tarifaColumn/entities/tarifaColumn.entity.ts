import { TarifaPrices } from "src/modules/tarifaPrices/entities/tarifaPrices.entity";
import { Tarifario } from "src/modules/tarifario/entities/tarifario.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifaColumn')
export class TarifaColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'ID de la tarifa asociada' })
  tarifa_id: number;

  @Column()
  description: string;

  @Column()
  paxMin: number;

  @Column()
  paxMax: number;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Indica si el precio de la columna se cobra por pasajero (compartido) o por servicio (privado)'
  })
  isShared: boolean;

  @ManyToOne(() => Tarifario, tc => tc.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarifa_id' })
  tarifa: Tarifario;

  @OneToMany(() => TarifaPrices, tp => tp.column, { cascade: true })
  prices: TarifaPrices[];
  
}
