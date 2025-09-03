import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentsService } from './components.service';
import { ComponentsController } from './components.controller';
import { Component } from './entities/component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Component])],
  providers: [ComponentsService],
  controllers: [ComponentsController],
  exports: [ComponentsService], // Para usar en otros módulos
})
export class ComponentsModule {}
