import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PasajerosService } from './pasajeros.service';
import { CreatePasajeroDto } from './dto/create-pasajero.dto';
import { UpdatePasajeroDto } from './dto/update-pasajero.dto';
import { File as MulterFile } from 'multer';

@Controller('pasajeros')
export class PasajerosController {
  private readonly logger = new Logger(PasajerosController.name);

  constructor(private readonly pasajerosService: PasajerosService) {}

  @Post()
  async create(@Body() createPasajeroDto: CreatePasajeroDto) {
    this.logger.log('Creando pasajero', createPasajeroDto);
    return this.pasajerosService.create(createPasajeroDto);
  }

  @Get()
  async findAll() {
    this.logger.log('Listando todos los pasajeros');
    return this.pasajerosService.findAll();
  }

  @Get('cotizacion/:cotizacionId')
  async findByCotizacion(@Param('cotizacionId') cotizacionId: string) {
    this.logger.log(`Buscando pasajeros de cotización: ${cotizacionId}`);
    return this.pasajerosService.findByCotizacion(Number(cotizacionId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando pasajero con id: ${id}`);
    return this.pasajerosService.findOne(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePasajeroDto: UpdatePasajeroDto) {
    this.logger.log(`Actualizando pasajero ${id}`);
    return this.pasajerosService.update(Number(id), updatePasajeroDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando pasajero ${id}`);
    return this.pasajerosService.remove(Number(id));
  }

  @Delete('cotizacion/:cotizacionId')
  async removeByCotizacion(@Param('cotizacionId') cotizacionId: string) {
    this.logger.log(`Eliminando pasajeros de cotización ${cotizacionId}`);
    return this.pasajerosService.removeByCotizacion(Number(cotizacionId));
  }

  // Endpoints con archivos
  @Post('with-file')
  @UseInterceptors(FileInterceptor('file'))
  async createWithFile(
    @Body() createPasajeroDto: CreatePasajeroDto,
    @UploadedFile() file: MulterFile
  ) {
    this.logger.log('Creando pasajero con archivo', createPasajeroDto);
    return this.pasajerosService.createWithFile(file, createPasajeroDto);
  }

  @Patch(':id/with-file')
  @UseInterceptors(FileInterceptor('file'))
  async updateWithFile(
    @Param('id') id: string,
    @Body() updatePasajeroDto: UpdatePasajeroDto,
    @UploadedFile() file: MulterFile
  ) {
    this.logger.log(`Actualizando pasajero ${id} con archivo`);
    return this.pasajerosService.updateWithFile(Number(id), file, updatePasajeroDto);
  }

  @Delete(':id/with-file')
  async removeWithFile(@Param('id') id: string) {
    this.logger.log(`Eliminando pasajero ${id} con archivo`);
    return this.pasajerosService.removeWithFile(Number(id));
  }
}
