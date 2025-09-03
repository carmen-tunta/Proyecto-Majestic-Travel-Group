import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItineraryTemplate } from './entities/itinerary-template.entity';
import { ItineraryTemplateService } from './itinerary-template.service';
import { ItineraryTemplateController } from './itinerary-template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ItineraryTemplate])],
  providers: [ItineraryTemplateService],
  controllers: [ItineraryTemplateController],
  exports: [ItineraryTemplateService],
})
export class ItineraryTemplateModule {}