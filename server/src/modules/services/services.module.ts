import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './entities/service.entity';
import { Component } from '../components/entities/component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Component])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
