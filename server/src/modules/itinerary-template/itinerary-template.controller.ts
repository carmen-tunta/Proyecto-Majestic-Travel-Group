import { Body, Controller, Get, Param, Post, Put, Query, BadRequestException } from '@nestjs/common';
import { ItineraryTemplateService } from './itinerary-template.service';
import { ItineraryTemplate } from './entities/itinerary-template.entity';

@Controller('itinerary-template')
export class ItineraryTemplateController {
    constructor(private readonly itineraryTemplateService: ItineraryTemplateService) { }

    @Post()
    async createTemplate(@Body() createTemplateDto: { templateTitle: string; itineraryTitle: string }): Promise<ItineraryTemplate> {
        return await this.itineraryTemplateService.create(createTemplateDto.templateTitle, createTemplateDto.itineraryTitle);
    }

    @Get()
    async getAllTemplates(): Promise<ItineraryTemplate[]> {
        return await this.itineraryTemplateService.findAll();
    }

    @Get(':id')
    async getTemplateById(@Body('id') id: number): Promise<ItineraryTemplate | null> {
        return await this.itineraryTemplateService.findById(id);
    }

    @Put('update/:id')
    async updateTemplate(@Param('id') id: number, @Body() updateTemplateDto: { templateTitle: string; itineraryTitle: string }): Promise<ItineraryTemplate | null> {
        return await this.itineraryTemplateService.update(id, updateTemplateDto.templateTitle, updateTemplateDto.itineraryTitle);
    }

    @Get('search')
    async searchTemplates(@Query('name') name: string): Promise<ItineraryTemplate[]> {
        if (!name || name.trim() === '') {
            throw new BadRequestException("El parámetro 'name' es requerido y no puede estar vacío.");
        }
        return await this.itineraryTemplateService.searchByName(name);
    }
}
