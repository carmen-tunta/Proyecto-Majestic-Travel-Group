import { TarifaComponent } from "src/modules/tarifaComponent/entities/tarifaComponent.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifaPrices')
export class TarifaPrices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  paxMin: number;

  @Column()
  paxMax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

//   @ManyToOne(() => TarifaComponent, tc => tc.precios, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'tarifa_componente_id' })
//   tarifaComponent: TarifaComponent;
}
