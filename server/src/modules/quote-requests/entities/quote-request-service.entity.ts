import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { QuoteRequest } from './quote-request.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('quote_request_services')
export class QuoteRequestService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QuoteRequest, (qr) => qr.services, { nullable: false, onDelete: 'CASCADE' })
  quoteRequest: QuoteRequest;

  @ManyToOne(() => Service, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  service: Service;

}


