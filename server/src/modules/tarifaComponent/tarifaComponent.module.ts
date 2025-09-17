import { Module } from "@nestjs/common";
import { TarifaComponent } from "./entities/tarifaComponent.entity";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { TarifaComponentService } from "./tarifaComponent.service";
import { TarifaComponentController } from "./tarifaComponent.controller";

@Module({
    imports: [TypeOrmModule.forFeature([TarifaComponent])],
    providers: [TarifaComponentService],
    controllers: [TarifaComponentController],
})

export class TarifaComponentModule { }