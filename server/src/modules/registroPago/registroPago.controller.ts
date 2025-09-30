import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { RegistroPagoService } from "./registroPago.service";
import { RegistroPago } from "./entities/registroPago.entity";

@Controller('registro-pago')
export class RegistroPagoController {
    constructor(private readonly registroPagoService: RegistroPagoService) { }

    @Post()
    async createRegistroPago(@Body() data: Partial<RegistroPago>): Promise<RegistroPago> {
        return await this.registroPagoService.create(data);
    }

    @Get()
    async findAllRegistroPagos(): Promise<RegistroPago[]> {
        return await this.registroPagoService.findAll();
    }

    @Get('cotizacion/:id')
    async findRegistroPagoByCotizacionId(@Param('id') id: number): Promise<RegistroPago[]> {
        return await this.registroPagoService.findByCotizacionId(id);
    }

    @Put('update/:id')
    async updateRegistroPago(@Param('id') id: number, @Body() data: Partial<RegistroPago>): Promise<RegistroPago | null> {
        return await this.registroPagoService.update(id, data);
    }

    @Delete(':id')
    async deleteRegistroPago(@Param('id') id: number): Promise<{ success: boolean }> {
        const success = await this.registroPagoService.delete(id);
        return { success };
    }
}