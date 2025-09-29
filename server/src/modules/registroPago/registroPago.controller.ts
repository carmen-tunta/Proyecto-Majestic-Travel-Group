import { Body, Controller, Get, Post } from "@nestjs/common";
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

    @Get(':id')
    async findRegistroPagoById(@Body('id') id: number): Promise<RegistroPago | null> {
        return await this.registroPagoService.findById(id);
    }

    @Post('update/:id')
    async updateRegistroPago(@Body('id') id: number, @Body() data: Partial<RegistroPago>): Promise<RegistroPago | null> {
        return await this.registroPagoService.update(id, data);
    }

    @Post(':id')
    async deleteRegistroPago(@Body('id') id: number): Promise<{ success: boolean }> {
        const success = await this.registroPagoService.delete(id);
        return { success };
    }
}