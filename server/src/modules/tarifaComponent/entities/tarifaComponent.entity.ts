import { Component } from "src/modules/components/entities/component.entity";
import { TarifaPrices } from "src/modules/tarifaPrices/entities/tarifaPrices.entity";
import { Tarifario } from "src/modules/tarifario/entities/tarifario.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tarifaComponent')
export class TarifaComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'ID del tarifario asociado' })
  tarifa_id: number;

  @Column({ type: 'int', comment: 'ID del componente asociado' })
  componente_id: number;

  @Column({ type: 'varchar', length: 20, default: 'per_pax', comment: 'Tipo de costo: per_pax o per_service' })
  costType: string;

  @ManyToOne(() => Tarifario, t => t.components, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarifa_id' })
  tarifa: Tarifario;

  @ManyToOne(() => Component, c => c.tarifas, { eager: true })
  @JoinColumn({ name: 'componente_id' })
  component: Component;

  @OneToMany(() => TarifaPrices, tp => tp.component, { cascade: true })
  prices: TarifaPrices[];

}
