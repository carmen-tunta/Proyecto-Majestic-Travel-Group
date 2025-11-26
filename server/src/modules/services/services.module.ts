import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './entities/service.entity';
import { ServiceComponent } from './entities/service-component.entity';
import { Component } from '../components/entities/component.entity';
import { Portada } from './entities/portada.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceComponent, Component, Portada])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
