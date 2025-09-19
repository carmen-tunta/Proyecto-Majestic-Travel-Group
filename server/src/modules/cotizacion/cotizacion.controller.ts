import { Controller, Post, Body, Get, Param, Logger, Put, Delete } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Body as ReqBody } from '@nestjs/common';

@Controller('cotizacion')
export class CotizacionController {
  private readonly logger = new Logger(CotizacionController.name);

  constructor(private readonly cotizacionService: CotizacionService) {}

  @Post()
  async create(@Body() createCotizacionDto: CreateCotizacionDto) {
    this.logger.log('Creando cotización', createCotizacionDto);
    return this.cotizacionService.create(createCotizacionDto);
  }



  @Get()
  async findAll() {
    this.logger.log('Listando todas las cotizaciones');
    const cotizaciones = await this.cotizacionService.findAll();
    return cotizaciones.map(c => ({
      ...c,
      fechaViaje: c.fechaViaje ? this.formatFechaES(c.fechaViaje) : null
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando cotización con id: ${id}`);
    const c = await this.cotizacionService.findOne(Number(id));
    return {
      ...c,
      fechaViaje: c.fechaViaje ? this.formatFechaES(c.fechaViaje) : null
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<CreateCotizacionDto>) {
    this.logger.log(`Actualizando cotización ${id}`);
    return this.cotizacionService.update(Number(id), body);
  }

  // Detalle con servicios y componentes
  @Get(':id/detalle')
  async getDetail(@Param('id') id: string) {
    return this.cotizacionService.getDetail(Number(id));
  }

  // Agregar un servicio a la cotización
  @Post(':id/servicios')
  async addService(
    @Param('id') id: string,
    @ReqBody() body: { serviceId: number; precio?: number }
  ) {
    return this.cotizacionService.addService(Number(id), body.serviceId, undefined, body.precio);
  }

  // Agregar componentes a un servicio de la cotización
  @Post('servicios/:csId/componentes')
  async addComponents(
    @Param('csId') csId: string,
    @ReqBody() body: { componentIds: number[] }
  ) {
    return this.cotizacionService.addComponentsToService(Number(csId), body.componentIds || []);
  }

  // Agregar componente extra (nombre libre)
  @Post('servicios/:csId/componentes-extra')
  async addExtraComponent(
    @Param('csId') csId: string,
    @ReqBody() body: { nombre: string; precio?: number }
  ) {
    return this.cotizacionService.addExtraComponentToService(Number(csId), body.nombre, body.precio);
  }

  // Actualizar nota/precio de un servicio agregado a la cotización
  @Put('servicios/:csId')
  async updateServiceItem(
    @Param('csId') csId: string,
    @ReqBody() body: { precio?: number }
  ) {
    return this.cotizacionService.updateServiceItem(Number(csId), body as any);
  }

  // Actualizar nota/precio de un componente dentro de un servicio agregado
  @Put('servicios/componentes/:cscId')
  async updateServiceComponentItem(
    @Param('cscId') cscId: string,
    @ReqBody() body: { nota?: string; precio?: number }
  ) {
    return this.cotizacionService.updateServiceComponentItem(Number(cscId), body);
  }

  // Eliminar un servicio agregado en la cotización (y sus componentes)
  @Delete('servicios/:csId')
  async deleteServiceItem(@Param('csId') csId: string) {
    return this.cotizacionService.deleteServiceItem(Number(csId));
  }

  // Eliminar un componente de un servicio agregado
  @Delete('servicios/componentes/:cscId')
  async deleteServiceComponentItem(@Param('cscId') cscId: string) {
    return this.cotizacionService.deleteServiceComponentItem(Number(cscId));
  }

  private formatFechaES(date: Date | string): string {
    const d = new Date(date);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[d.getDay()]} ${d.getDate().toString().padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
  }

//


// Eliminado duplicado de findOne
}
