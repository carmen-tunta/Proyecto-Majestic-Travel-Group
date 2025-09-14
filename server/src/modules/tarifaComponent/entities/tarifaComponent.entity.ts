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

  @ManyToOne(() => Tarifario, t => t.components, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarifa_id' })
  tarifa: Tarifario;

  @ManyToOne(() => Component, c => c.tarifas, { eager: true })
  @JoinColumn({ name: 'componente_id' })
  component: Component;

//   @OneToMany(() => TarifaPrices, tp => tp.tarifaComponent, { cascade: true })
//   precios: TarifaPrices[];
}
