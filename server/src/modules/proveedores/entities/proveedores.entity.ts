import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { ProveedorContact } from 'src/modules/proveedor-contact/entities/proveedor-contact.entity';
import { Tarifario } from 'src/modules/tarifario/entities/tarifario.entity';

@Entity('proveedores')
export class Proveedores {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', comment: 'Nombre del proveedor', nullable: false })
  name: string;

  @Column({ type: 'text', comment: 'Representante legal', nullable: true })
  legal: string;

  @Column({ type: 'text', comment: 'Tipo de servicio', nullable: false })
  serviceType: string;

  @Column({ type: 'text', comment: 'Ciudad', nullable: true })
  city: string;

  @Column({ type: 'text', comment: 'WhatsApp', nullable: true })
  whatsapp: string;

  @Column({ type: 'text', comment: 'Correo electrónico', nullable: true })
  mail: string;

  @Column({ type: 'json', comment: 'Idiomas', nullable: true })
  languages: string[];

  @Column({ length: 15, comment: 'Tipo de documento', nullable: true })
  documentType: string;

  @Column({ type: 'int', comment: 'Número de documento', nullable: true })
  documentNumber: number | null;

  @Column({ type: 'text', comment: 'Dirección', nullable: true })
  direction: string;

  @Column({ type: 'date', comment: 'Fecha de nacimiento', nullable: true })
  birthdate: Date;

  @Column({ length: 10, comment: 'Género', nullable: true })
  gender: string;

  @Column({ type: 'date', comment: 'Fecha de registro' })
  registrationDate: Date;

  @OneToMany(() => ProveedorContact, contact => contact.proveedor)
  contacts: ProveedorContact[];

  @OneToOne(() => Tarifario, tarifario => tarifario.proveedor)
  tarifario: Tarifario;
}
