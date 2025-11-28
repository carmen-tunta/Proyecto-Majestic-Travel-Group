import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItineraryTemplate } from './entities/itinerary-template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItineraryTemplateService {
    constructor(
        @InjectRepository(ItineraryTemplate)
        private itineraryTemplateRepository: Repository<ItineraryTemplate>,
    ) { }

    async create(templateTitle: string, itineraryTitle: string, description: string): Promise<ItineraryTemplate> {
        const template = this.itineraryTemplateRepository.create({
            templateTitle: templateTitle,
            itineraryTitle: itineraryTitle,
            description: description
        });
        return await this.itineraryTemplateRepository.save(template);
    }

    async findAll(page: number = 0, limit: number = 15): Promise<{ data: ItineraryTemplate[], total: number, page: number, limit: number }> {
        const [data, total] = await this.itineraryTemplateRepository.findAndCount({
            skip: page * limit,
            take: limit,
            order: { id: 'DESC' } // Opcional: ordenar por ID descendente
        });

        return {
            data,
            total,
            page,
            limit
        };
    }

    async findById(id: number): Promise<ItineraryTemplate | null> {
        return await this.itineraryTemplateRepository.findOne({ where: { id } });
    }

    async update(id: number, templateTitle: string, itineraryTitle: string, description: string): Promise<ItineraryTemplate | null> {
        const template = await this.findById(id);
        if (!template) return null;

        template.templateTitle = templateTitle;
        template.itineraryTitle = itineraryTitle;
        template.description = description;

        await this.itineraryTemplateRepository.save(template);
        return template;
    }

    async searchByName(name: string): Promise<ItineraryTemplate[]> {
        const cleanName = name.trim().toLowerCase();
        return await this.itineraryTemplateRepository.createQueryBuilder('itineraryTemplate')
            .where('LOWER(TRIM(itineraryTemplate.templateTitle)) LIKE :name', { name: `%${cleanName}%` })
            .getMany();
    }
}
