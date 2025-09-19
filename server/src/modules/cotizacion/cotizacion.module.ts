import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CotizacionService } from './cotizacion.service';
import { CotizacionController } from './cotizacion.controller';
import { Client } from '../clients/entities/client.entity';
import { CotizacionServicio } from './entities/cotizacion-servicio.entity';
import { CotizacionServicioComponente } from './entities/cotizacion-servicio-componente.entity';
import { Service } from '../services/entities/service.entity';
import { Component } from '../components/entities/component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cotizacion, Client, CotizacionServicio, CotizacionServicioComponente, Service, Component])],
  providers: [CotizacionService],
  controllers: [CotizacionController],
  exports: [CotizacionService],
})
export class CotizacionModule {}
