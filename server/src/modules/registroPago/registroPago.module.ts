import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RegistroPago } from "./entities/registroPago.entity";
import { RegistroPagoController } from "./registroPago.controller";
import { RegistroPagoService } from "./registroPago.service";

@Module({
    imports: [TypeOrmModule.forFeature([RegistroPago])],
    controllers: [RegistroPagoController],
    providers: [RegistroPagoService]
})

export class RegistroPagoModule {}