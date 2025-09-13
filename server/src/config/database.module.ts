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
import { Proveedores } from 'src/modules/proveedores/entities/proveedores.entity';
import { ProveedorContact } from 'src/modules/proveedor-contact/entities/proveedor-contact.entity';
import { Tarifario } from 'src/modules/tarifario/entities/tarifario.entity';

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
                  Proveedores, 
                  ProveedorContact,
                  Tarifario
                ], // Aquí se agregarán las entidades
      synchronize: true, // Cambia a true solo en desarrollo
    }),
  ],
})
export class DatabaseModule {}
