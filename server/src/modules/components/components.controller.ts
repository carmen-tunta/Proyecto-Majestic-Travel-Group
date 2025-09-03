import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  Query 
} from '@nestjs/common';
import { ComponentsService } from './components.service';

@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  // CREATE - Crear un nuevo componente
  @Post()
  async create(@Body() createComponentDto: {
    componentName: string;
    serviceType: string;
    description?: string;
  }) {
    return await this.componentsService.create(createComponentDto);
  }

  // READ - Obtener todos los componentes
  @Get()
  async findAll(@Query('active') active?: string) {
    if (active === 'true') {
      return await this.componentsService.findActive();
    }
    return await this.componentsService.findAll();
  }

  // READ - Obtener componente por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.componentsService.findOne(id);
  }

  // READ - Buscar componentes por tipo de servicio
  @Get('service-type/:serviceType')
  async findByServiceType(@Param('serviceType') serviceType: string) {
    return await this.componentsService.findByServiceType(serviceType);
  }

  // UPDATE - Actualizar un componente
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComponentDto: {
      componentName?: string;
      serviceType?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    return await this.componentsService.update(id, updateComponentDto);
  }

  // DELETE - Desactivar un componente (soft delete)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.componentsService.remove(id);
  }

  // DELETE - Eliminar permanentemente un componente
  @Delete(':id/permanent')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.componentsService.delete(id);
  }
}
