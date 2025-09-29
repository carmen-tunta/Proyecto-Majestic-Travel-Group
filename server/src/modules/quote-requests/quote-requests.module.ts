import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteRequest } from './entities/quote-request.entity';
import { QuoteRequestService as QrServiceEntity } from './entities/quote-request-service.entity';
import { QuoteRequestsService } from './quote-requests.service';
import { QuoteRequestsController } from './quote-requests.controller';
import { Client } from '../clients/entities/client.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuoteRequest, QrServiceEntity, Client, Service])],
  providers: [QuoteRequestsService],
  controllers: [QuoteRequestsController],
  exports: [QuoteRequestsService],
})
export class QuoteRequestsModule {}


