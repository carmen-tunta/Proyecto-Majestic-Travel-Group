import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TarifaIncrement } from "./entities/increment.entity";
import { TarifaIncrementService } from "./tarifaIncrement.service";
import { TarifaIncrementController } from "./tarifaIncrement.controller";

@Module({
    imports: [TypeOrmModule.forFeature([TarifaIncrement])],
    controllers: [TarifaIncrementController],
    providers: [TarifaIncrementService],
})
export class TarifaIncrementModule {}