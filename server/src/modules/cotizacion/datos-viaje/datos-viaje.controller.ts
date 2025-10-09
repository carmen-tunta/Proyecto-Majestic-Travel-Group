import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { DatosViajeService } from "./datos-viaje.service";
import { DatosViaje } from "../entities/datos-viaje.entity";

@Controller('datos-viaje')
export class DatosViajeController {
    constructor(private readonly datosViajeService: DatosViajeService) {}

    @Post()
    async createDatosViaje(@Body() data: Partial<DatosViaje>): Promise<DatosViaje> {
        return this.datosViajeService.create(data);
    }

    @Get(':cotizacionId')
    async getDatosViajeByCotizacionId(@Param('cotizacionId') cotizacionId: number): Promise<DatosViaje | null> {
        return this.datosViajeService.findByCotizacionId(cotizacionId);
    }

    @Put('update/:cotizacionId')
    async updateDatosViaje(
        @Param('cotizacionId') cotizacionId: number,
        @Body() data: Partial<DatosViaje>
    ): Promise<DatosViaje | null> {
        return this.datosViajeService.update(cotizacionId, data);
    }
}