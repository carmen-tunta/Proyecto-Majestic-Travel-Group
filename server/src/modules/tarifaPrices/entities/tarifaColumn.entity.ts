import { TarifaComponent } from "src/modules/tarifaComponent/entities/tarifaComponent.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifaColumn')
export class TarifaColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'ID del tarifa_componente asociado' })
  tarifa_component_id: number;

  @Column()
  description: string;

  @Column()
  paxMin: number;

  @Column()
  paxMax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => TarifaComponent, tc => tc.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarifa_component_id' })
  tarifaComponent: TarifaComponent;
}
