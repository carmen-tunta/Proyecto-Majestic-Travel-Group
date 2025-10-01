import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { QuoteRequestService } from './quote-request-service.entity';
import { User } from '../../users/entities/user.entity';

export type QuoteRequestStatus = 'recibido' | 'en_progreso' | 'cotizando' | 'liberado' | 'sin_respuesta';

@Entity('quote_requests')
export class QuoteRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  client: Client;

  @Column({ type: 'text' })
  passengerName: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  countryCode: string; // ej. "+51"

  @Column({ type: 'text' })
  whatsapp: string; // solo números

  @Column({ type: 'date', nullable: true })
  travelDate: Date | null;

  @Column({ type: 'longtext', nullable: true })
  message: string | null;

  @Column({
    type: 'enum',
    enum: ['recibido', 'en_progreso', 'cotizando', 'liberado', 'sin_respuesta'],
    default: 'recibido',
  })
  status: QuoteRequestStatus;

  @Column({ type: 'int', nullable: true })
  agentId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  agent: User | null;

  @Column({ type: 'text', default: 'public_web' })
  source: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => QuoteRequestService, (qrs) => qrs.quoteRequest, { cascade: true })
  services: QuoteRequestService[];

}


