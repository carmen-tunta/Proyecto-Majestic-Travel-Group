import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactClientsService } from './contact-clients.service';
import { ContactClientsController } from './contact-clients.controller';
import { clientesContact } from './entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([clientesContact])],
  controllers: [ContactClientsController],
  providers: [ContactClientsService],
  exports: [ContactClientsService],
})
export class ContactClientsModule {}
