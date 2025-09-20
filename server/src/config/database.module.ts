import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { User } from '../modules/users/entities/user.entity';
import { ItineraryTemplate } from 'src/modules/itinerary-template/entities/itinerary-template.entity';
import { Component } from '../modules/components/entities/component.entity';
import { Service } from '../modules/services/entities/service.entity';
import { Client } from '../modules/clients/entities/client.entity';

import { clientesContact } from '../modules/contact-clients/entities/contact.entity';

import { Proveedores } from 'src/modules/proveedores/entities/proveedores.entity';
import { ProveedorContact } from 'src/modules/proveedor-contact/entities/proveedor-contact.entity';
import { Tarifario } from 'src/modules/tarifario/entities/tarifario.entity';
import { TarifaComponent } from 'src/modules/tarifaComponent/entities/tarifaComponent.entity';
import { TarifaColumn } from 'src/modules/tarifaColumn/entities/tarifaColumn.entity';
import { TarifaPrices } from 'src/modules/tarifaPrices/entities/tarifaPrices.entity';
import { TarifaIncrement } from 'src/modules/tarifaIncrement/entities/increment.entity';
import { ServiceImage } from 'src/modules/serviceImages/entities/serviceImages.entity';
import { TarifarioDocuments } from 'src/modules/tarifarioDocuments/entities/tarifarioDocuments.entity';
import { Cotizacion } from 'src/modules/cotizacion/entities/cotizacion.entity';
import { CotizacionServicio } from 'src/modules/cotizacion/entities/cotizacion-servicio.entity';
import { CotizacionServicioComponente } from 'src/modules/cotizacion/entities/cotizacion-servicio-componente.entity';
import { Pasajero } from 'src/modules/pasajeros/entities/pasajero.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      

      entities: [User, 
                  ItineraryTemplate, 
                  Component, 
                  Service, 
                  Client, 
                  clientesContact,        
                  Proveedores, 
                  ProveedorContact,
                  Tarifario,
                  TarifaComponent,
                  TarifaColumn,
                  TarifaPrices,
                  TarifaIncrement,
                  ServiceImage,
                  TarifarioDocuments,
                  Cotizacion,
                  CotizacionServicio,
                  CotizacionServicioComponente,
                  Pasajero
                ], // Aquí se agregarán las entidades

      synchronize: true, // Cambia a true solo en desarrollo
    }),
  ],
})
export class DatabaseModule {}
