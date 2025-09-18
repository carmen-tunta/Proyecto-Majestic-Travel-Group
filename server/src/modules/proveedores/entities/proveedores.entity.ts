import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { ProveedorContact } from 'src/modules/proveedor-contact/entities/proveedor-contact.entity';
import { Tarifario } from 'src/modules/tarifario/entities/tarifario.entity';

@Entity('proveedores')
export class Proveedores {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', comment: 'Nombre del proveedor' })
  name: string;

  @Column({ type: 'text', comment: 'Representante legal' })
  legal: string;

  @Column({ type: 'text', comment: 'Tipo de servicio' })
  serviceType: string;

  @Column({ type: 'text', comment: 'Ciudad' })
  city: string;

  @Column({ type: 'text', comment: 'WhatsApp' })
  whatsapp: string;

  @Column({ type: 'text', comment: 'Correo electrónico' })
  mail: string;

  @Column({ type: 'json', comment: 'Idiomas' })
  languages: string[];

  @Column({ length: 15, comment: 'Tipo de documento' })
  documentType: string;

  @Column({ comment: 'Número de documento' })
  documentNumber: number;

  @Column({ type: 'text', comment: 'Dirección' })
  direction: string;

  @Column({ type: 'date', comment: 'Fecha de nacimiento' })
  birthdate: Date;

  @Column({ length: 10, comment: 'Género' })
  gender: string;

  @Column({ type: 'date', comment: 'Fecha de registro' })
  registrationDate: Date;

  @OneToMany(() => ProveedorContact, contact => contact.proveedor)
  contacts: ProveedorContact[];

  @OneToOne(() => Tarifario, tarifario => tarifario.proveedor)
  tarifario: Tarifario;
}
