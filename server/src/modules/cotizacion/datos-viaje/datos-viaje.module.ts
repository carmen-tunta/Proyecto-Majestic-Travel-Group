import { Module } from "@nestjs/common";
import { DatosViajeService } from "./datos-viaje.service";
import { DatosViajeController } from "./datos-viaje.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatosViaje } from "../entities/datos-viaje.entity";

@Module({
    imports: [TypeOrmModule.forFeature([DatosViaje])],
    providers: [DatosViajeService],
    controllers: [DatosViajeController]
})

export class DatosViajeModule {}