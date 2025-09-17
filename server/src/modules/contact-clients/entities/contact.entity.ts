import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('contacts')
export class clientesContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  medio: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  nota: string;

  @Column({ name: 'client_id' })
  clientId: number;

  @ManyToOne(() => Client, client => client.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

}
