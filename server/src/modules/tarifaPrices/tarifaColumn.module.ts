import { Module } from "@nestjs/common";
import { TarifaColumnService } from "./tarifaColumn.service";
import { TarifaColumnController } from "./tarifaColumn.controller";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { TarifaColumn } from "./entities/tarifaColumn.entity";

@Module({
    imports: [TypeOrmModule.forFeature([TarifaColumn])],
    providers: [TarifaColumnService],
    controllers: [TarifaColumnController],
})

export class TarifaColumnModule { }