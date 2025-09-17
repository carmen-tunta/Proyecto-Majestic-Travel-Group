import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { TarifaPricesService } from "./tarifaPrices.service";
import { TarifaPrices } from "./entities/tarifaPrices.entity";

@Controller('tarifa-prices')
export class TarifaPricesController {
    constructor(private readonly tarifaPricesService: TarifaPricesService) { }

    @Post()
    createTarifaPrice(@Body() data: Partial<TarifaPrices>) {
        return this.tarifaPricesService.create(data);
    }

    @Get()
    findAllTarifaPrices() {
        return this.tarifaPricesService.findAll();
    }

    @Get('component/:componentId/column/:columnId')
    findComponentColumnId(@Param('componentId') componentId: number, @Param('columnId') columnId: number) {
        return this.tarifaPricesService.findByComponentColumnId(componentId, columnId);
    }

    @Get('tarifa/:id')
    findPriceByTarifaId(@Param('id') id: string) {
        return this.tarifaPricesService.findByTarifaId(id);
    }

    @Put('update/:id')
    updateTarifaPrice(@Param('id') id: string, @Body() data: Partial<TarifaPrices>) {
        return this.tarifaPricesService.update(id, data);
    }

    @Delete(':id')
    deleteTarifaPrice(@Param('id') id: string) {
        return this.tarifaPricesService.remove(id);
    }
}