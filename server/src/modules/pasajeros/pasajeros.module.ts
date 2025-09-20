import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pasajero } from './entities/pasajero.entity';
import { Cotizacion } from '../cotizacion/entities/cotizacion.entity';
import { PasajerosService } from './pasajeros.service';
import { PasajerosController } from './pasajeros.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pasajero, Cotizacion])],
  controllers: [PasajerosController],
  providers: [PasajerosService],
  exports: [PasajerosService],
})
export class PasajerosModule {}
