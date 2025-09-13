import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Proveedores } from 'src/modules/proveedores/entities/proveedores.entity';

@Entity('proveedorContact')
export class ProveedorContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    length: 50, 
    comment: 'Medio de contacto' 
  })
  medium: string;

  @Column({ 
    length: 75, 
    comment: 'Descripción del medio de contacto' 
  })
  description: string;

  @Column({ 
    type: 'longtext', 
    comment: 'Nota adicional' 
  })
  note: string;

  @Column({ 
    type: 'int', 
    comment: 'ID del proveedor asociado',
    nullable: false 
  })
  proveedorId: number;

  @ManyToOne(() => Proveedores, proveedor => proveedor.contacts, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedores | null;
}
