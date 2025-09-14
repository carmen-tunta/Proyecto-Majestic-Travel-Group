import { Proveedores } from 'src/modules/proveedores/entities/proveedores.entity';
import { TarifaComponent } from 'src/modules/tarifaComponent/entities/tarifaComponent.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('tarifario')
export class Tarifario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', comment: 'Fecha de vigencia desde' })
  validityFrom: Date;

  @Column({ type: 'date', comment: 'Fecha de vigencia hasta' })
  validityTo: Date;

  @Column({ 
    length: 50, 
    comment: 'Observación sobre la tarifa' 
  })
  observation: string;

  @Column({ 
    type: 'int', 
    comment: 'ID del proveedor asociado', 
    nullable: false 
  })
  proveedorId: number;

  @OneToOne(() => Proveedores, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedores;

  @OneToMany(() => TarifaComponent, tc => tc.tarifa, { cascade: true })
  components: TarifaComponent[];
}
