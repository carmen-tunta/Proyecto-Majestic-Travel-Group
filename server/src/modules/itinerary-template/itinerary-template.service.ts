import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItineraryTemplate } from './entities/itinerary-template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItineraryTemplateService {
    constructor(
        @InjectRepository(ItineraryTemplate)
        private itineraryTemplateRepository: Repository<ItineraryTemplate>,
    ) {}

    async create(templateTitle: string, itineraryTitle: string): Promise<ItineraryTemplate> {
        const template = this.itineraryTemplateRepository.create({
            templateTitle: templateTitle,
            itineraryTitle: itineraryTitle,
        });
        return await this.itineraryTemplateRepository.save(template);
    }

    async findAll(): Promise<ItineraryTemplate[]> {
        return await this.itineraryTemplateRepository.find();
    }

    async findById(id: number): Promise<ItineraryTemplate | null> {
        return await this.itineraryTemplateRepository.findOne({ where: { id } });
    }

    async update(id: number, templateTitle: string, itineraryTitle: string): Promise<ItineraryTemplate | null> {
        const template = await this.findById(id);
        if (!template) return null;

        template.templateTitle = templateTitle;
        template.itineraryTitle = itineraryTitle;

        await this.itineraryTemplateRepository.save(template);
        return template;
    }
}
