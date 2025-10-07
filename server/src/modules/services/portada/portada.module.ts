import { Module } from "@nestjs/common";
import { PortadaController } from "./portada.controller";
import { PortadaService } from "./portada.service";
import { Portada } from "../entities/portada.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Portada])],
    controllers: [PortadaController],
    providers: [PortadaService]
})

export class PortadaModule {}