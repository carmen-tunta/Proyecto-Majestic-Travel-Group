import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';

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
    return this.cotizacionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando cotización con id: ${id}`);
    return this.cotizacionService.findOne(Number(id));
  }
}
