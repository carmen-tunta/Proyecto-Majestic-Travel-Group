import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { clientesContact } from '../../contact-clients/entities/contact.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    comment: 'Nombre del cliente',
  })
  nombre: string;

  @Column({
    type: 'text',
    comment: 'País del cliente',
  })
  pais: string;

  @Column({
    type: 'text',
    comment: 'Ciudad del cliente',
  })
  ciudad: string;

  @Column({
    type: 'text',
    comment: 'Dirección del cliente',
  })
  direccion: string;

  @Column({
    length: 20,
    comment: 'Número de WhatsApp del cliente',
  })
  whatsapp: string;

  @Column({
    type: 'text',
    unique: true,
    comment: 'Correo electrónico del cliente',
  })
  correo: string;

  @Column({
    type: 'date',
    comment: 'Fecha de nacimiento del cliente',
  })
  fechaNacimiento: Date;

  @Column({
    type: 'text',
    comment: 'Lengua nativa del cliente',
  })
  lenguaNativa: string;

  @Column({
    type: 'text',
    comment: 'Tipo de documento del cliente',
  })
  tipoDocumento: string;

  @Column({
    type: 'text',
    unique: true,
    comment: 'Número de documento del cliente',
  })
  numeroDocumento: string;

  @Column({
    type: 'text',
    comment: 'Mercado del cliente',
  })
  mercado: string;

  @Column({
    type: 'text',
    comment: 'Rubro del cliente',
  })
  rubro: string;

  @Column({
    type: 'enum',
    enum: ['Masculino', 'Femenino'],
    comment: 'Género del cliente',
  })
  genero: 'Masculino' | 'Femenino';

  @Column({
    type: 'date',
    comment: 'Fecha de registro del cliente',
  })
  fechaRegistro: Date;

  @Column({
    type: 'text',
    default: 'Registrado',
    comment: 'Estado del cliente',
  })
  estado: string;

  @OneToMany(() => clientesContact, contact => contact.client)
  contacts: clientesContact[];
}