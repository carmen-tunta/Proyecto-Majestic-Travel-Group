import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Crear un servicio y asociar componentes existentes
   * Body ejemplo:
   * {
   *   "name": "Tour Machu Picchu",
   *   "city": "Cusco",
   *   "componentIds": [1, 2, 3]
   * }
   */
  
  @Post()
  create(@Body() data: Partial<Service> & { componentIds?: number[] }) {
    return this.servicesService.create(data);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Service | null> {
    return this.servicesService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Service>): Promise<Service | null> {
    return this.servicesService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(Number(id));
  }
}
