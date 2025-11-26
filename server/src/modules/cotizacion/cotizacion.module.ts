import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CotizacionService } from './cotizacion.service';
import { CotizacionController } from './cotizacion.controller';
import { Client } from '../clients/entities/client.entity';
import { CotizacionServicio } from './entities/cotizacion-servicio.entity';
import { CotizacionServicioComponente } from './entities/cotizacion-servicio-componente.entity';
import { Service } from '../services/entities/service.entity';
import { ServiceComponent } from '../services/entities/service-component.entity';
import { Component } from '../components/entities/component.entity';
import { Proveedores } from '../proveedores/entities/proveedores.entity';
import { ConfirmacionReserva } from './entities/confirmacion-reserva.entity';
import { ConfirmacionReservaService } from './confirmacion-reserva/confirmacion-reserva.service';
import { ConfirmacionReservaController } from './confirmacion-reserva/confirmacion-reserva.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cotizacion, Client, CotizacionServicio, CotizacionServicioComponente, Service, ServiceComponent, Component, Proveedores, ConfirmacionReserva, User])],
  providers: [CotizacionService, ConfirmacionReservaService],
  controllers: [CotizacionController, ConfirmacionReservaController],
  exports: [CotizacionService],
})
export class CotizacionModule {}
