import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarifario } from './entities/tarifario.entity';
import { TarifarioService } from './tarifario.service';
import { TarifarioController } from './tarifario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tarifario])],
  providers: [TarifarioService],
  controllers: [TarifarioController],
})
export class TarifarioModule {}