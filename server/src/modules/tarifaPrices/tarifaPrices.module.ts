import { Module } from "@nestjs/common";
import { TypeOrmModule } from  '@nestjs/typeorm';
import { TarifaPrices } from "./entities/tarifaPrices.entity";
import { TarifaPricesService } from "./tarifaPrices.service";
import { TarifaPricesController } from "./tarifaPrices.controller";

@Module({
    imports: [TypeOrmModule.forFeature([TarifaPrices])],
    providers: [TarifaPricesService],
    controllers: [TarifaPricesController]
})

export class TarifaPricesModule { }