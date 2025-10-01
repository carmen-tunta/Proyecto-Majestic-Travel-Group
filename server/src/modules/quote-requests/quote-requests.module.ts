import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteRequest } from './entities/quote-request.entity';
import { QuoteRequestService as QrServiceEntity } from './entities/quote-request-service.entity';
import { QuoteRequestsService } from './quote-requests.service';
import { QuoteRequestsController } from './quote-requests.controller';
import { AssignmentService } from './services/assignment.service';
import { TimeoutService } from './services/timeout.service';
import { Client } from '../clients/entities/client.entity';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuoteRequest, QrServiceEntity, Client, Service, User])],
  providers: [QuoteRequestsService, AssignmentService, TimeoutService],
  controllers: [QuoteRequestsController],
  exports: [QuoteRequestsService, AssignmentService],
})
export class QuoteRequestsModule {}


