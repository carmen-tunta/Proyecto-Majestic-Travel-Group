import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('proveedores')
export class Proveedores {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'Nombre del proveedor' })
  name: string;

  @Column({ length: 50, comment: 'Representante legal' })
  legal: string;

  @Column({ length: 25, comment: 'Tipo de servicio' })
  serviceType: string;

  @Column({ length: 50, comment: 'Ciudad' })
  city: string;

  @Column({ length: 30, comment: 'WhatsApp' })
  whatssapp: string;

  @Column({ length: 50, comment: 'Correo electrónico' })
  mail: string;

  @Column({ type: 'json', comment: 'Idiomas' })
  languages: string[];

  @Column({ length: 15, comment: 'Tipo de documento' })
  documentType: string;

  @Column({ comment: 'Número de documento' })
  documentNumber: number;

  @Column({ type: 'date', comment: 'Fecha de nacimiento' })
  birthdate: Date;

  @Column({ length: 10, comment: 'Género' })
  gender: string;

  @Column({ type: 'date', comment: 'Fecha de registro' })
  registrationDate: Date;
}
