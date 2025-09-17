import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { clientesContact } from '../../contact-clients/entities/contact.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    comment: 'Nombre del cliente',
  })
  nombre: string;

  @Column({
    length: 100,
    comment: 'País del cliente',
  })
  pais: string;

  @Column({
    length: 100,
    comment: 'Ciudad del cliente',
  })
  ciudad: string;

  @Column({
    length: 255,
    comment: 'Dirección del cliente',
  })
  direccion: string;

  @Column({
    length: 20,
    comment: 'Número de WhatsApp del cliente',
  })
  whatsapp: string;

  @Column({
    length: 150,
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
    length: 50,
    comment: 'Lengua nativa del cliente',
  })
  lenguaNativa: string;

  @Column({
    length: 50,
    comment: 'Tipo de documento del cliente',
  })
  tipoDocumento: string;

  @Column({
    length: 50,
    unique: true,
    comment: 'Número de documento del cliente',
  })
  numeroDocumento: string;

  @Column({
    length: 100,
    comment: 'Mercado del cliente',
  })
  mercado: string;

  @Column({
    length: 100,
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
    type: 'varchar',
    length: 50,
    default: 'Registrado',
    comment: 'Estado del cliente',
  })
  estado: string;

  @OneToMany(() => clientesContact, contact => contact.client)
  contacts: clientesContact[];
}