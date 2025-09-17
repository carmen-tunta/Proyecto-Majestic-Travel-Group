import { TarifaColumn } from "src/modules/tarifaColumn/entities/tarifaColumn.entity";
import { TarifaComponent } from "src/modules/tarifaComponent/entities/tarifaComponent.entity";
import { Tarifario } from "src/modules/tarifario/entities/tarifario.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifaPrices')
export class TarifaPrices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'ID del componente asociado' })
  tarifa_component_id: number;

  @Column({ type: 'int', comment: 'ID de la columna asociada' })
  tarifa_column_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => TarifaComponent, com => com.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarifa_component_id' })
  component: TarifaComponent;

  @ManyToOne(() => TarifaColumn, col => col.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarifa_column_id', referencedColumnName: 'id' })
  column: TarifaColumn;
  
}
