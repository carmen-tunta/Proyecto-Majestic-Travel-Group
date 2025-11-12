import { Controller, Get, Post, Body, Param, Put, Delete, Query, BadRequestException } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  @RequirePermissions('SERVICIOS:CREATE')
  create(@Body() data: Partial<Service> & { componentIds?: number[] }) {
    return this.servicesService.create(data);
  }

  // Endpoint público para páginas públicas (Plan your trip)
  @Get('public')
  @Public()
  async findPublic(
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    const pageNum = parseInt(page || '0') || 0;
    const limitNum = parseInt(limit || '10') || 10;

    const services = await this.servicesService.findAll();
    return {
      data: services,
      total: services.length,
      page: pageNum,
      limit: limitNum
    };
  }

  // Endpoint público para búsqueda de servicios
  @Get('public/search')
  @Public()
  async searchPublicServices(@Query('name') name: string) {
    if (!name || name.trim() === '') {
      throw new BadRequestException("El parámetro 'name' es requerido y no puede estar vacío.");
    }
    return await this.servicesService.searchByName(name);
  }

  @Get()
    @RequirePermissions('SERVICIOS:VIEW')
    async findAll(
      @Query('page') page?: string,
      @Query('limit') limit?: string
    ) {
      const services = await this.servicesService.findAll();
      
      // Si no se especifican page y limit, devolver todos los servicios directamente
      if (!page && !limit) {
        return services;
      }
      
      // Si se especifica paginación, devolver con estructura paginada
      const pageNum = parseInt(page || '0') || 0;
      const limitNum = parseInt(limit || '10') || 10;
      return {
        data: services,
        total: services.length,
        page: pageNum,
        limit: limitNum
      };
    }

  @Get('search')
  @RequirePermissions('SERVICIOS:VIEW')
  async searchServices(@Query('name') name: string) {
    if (!name || name.trim() === '') {
      throw new BadRequestException("El parámetro 'name' es requerido y no puede estar vacío.");
    }
    return await this.servicesService.searchByName(name);
  }
  
  @Get(':id')
  @RequirePermissions('SERVICIOS:VIEW')
  findOne(@Param('id') id: string): Promise<Service | null> {
    return this.servicesService.findOne(Number(id));
  }

  @Put('update/:id')
  @RequirePermissions('SERVICIOS:EDIT')
  update(@Param('id') id: string, @Body() data: Partial<Service>): Promise<Service | null> {
    return this.servicesService.update(Number(id), data);
  }

  @Delete(':id')
  @RequirePermissions('SERVICIOS:DELETE')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(Number(id));
  }

  @Delete(':serviceId/component/:componentId')
    @RequirePermissions('SERVICIOS:EDIT')
    async removeComponentFromService(@Param('serviceId') serviceId: number, @Param('componentId') componentId: number): Promise<void> {
      await this.servicesService.removeComponentFromService(serviceId, componentId);
    }

  @Put(':serviceId/component')
    @RequirePermissions('SERVICIOS:EDIT')
    async addComponentsToService(@Param('serviceId') serviceId: number, @Body('componentIds') componentIds: number[]): Promise<Service | null> {
      return await this.servicesService.addComponentsToService(serviceId, componentIds);
    }
}

