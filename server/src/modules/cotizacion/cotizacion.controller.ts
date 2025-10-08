import { Controller, Post, Body, Get, Param, Logger, Put, Delete } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Body as ReqBody } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('cotizacion')
export class CotizacionController {
  private readonly logger = new Logger(CotizacionController.name);

  constructor(private readonly cotizacionService: CotizacionService) {}

  @Post()
  @RequirePermissions('COTIZACION:CREATE')
  async create(@Body() createCotizacionDto: CreateCotizacionDto, @CurrentUser() user: any) {
    this.logger.log('Creando cotización', createCotizacionDto);
    const userId = user?.sub || user?.id;
    return this.cotizacionService.create(createCotizacionDto, userId);
  }



  @Get()
  async findAll() {
    this.logger.log('Listando todas las cotizaciones');
    const cotizaciones = await this.cotizacionService.findAll();
    // Devolver fechaViaje sin formatear para evitar desfases; el frontend formatea localmente
    return cotizaciones;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando cotización con id: ${id}`);
    const c = await this.cotizacionService.findOne(Number(id));
    return c;
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
    @ReqBody() body: { nota?: string; precio?: number; scheduledAt?: string | null }
  ) {
    return this.cotizacionService.updateServiceComponentItem(Number(cscId), body);
  }

  // Asignar proveedor a un componente del servicio
  @Put('servicios/componentes/:cscId/proveedor')
  async assignProvider(
    @Param('cscId') cscId: string,
    @ReqBody() body: { proveedorId: number; precioTotal?: number }
  ) {
    return this.cotizacionService.assignProviderToComponent(Number(cscId), body.proveedorId, body.precioTotal);
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

  // Quitar formatFechaES: el formateo se hará en el frontend para mantener consistencia local

//


// Eliminado duplicado de findOne
}
