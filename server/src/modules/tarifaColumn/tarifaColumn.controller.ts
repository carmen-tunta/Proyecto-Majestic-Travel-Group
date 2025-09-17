import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { TarifaColumnService } from "./tarifaColumn.service";
import { TarifaColumn } from "./entities/tarifaColumn.entity";

@Controller('tarifa-column') 
export class TarifaColumnController { 
    constructor(private readonly tarifaColumnService: TarifaColumnService) { }

    @Post()
    createTarifaColumn(@Body() data: Partial<TarifaColumn>) {
        return this.tarifaColumnService.create(data);
    }

    @Get()
    findAllTarifaColumns() {
        return this.tarifaColumnService.findAll();
    }

    @Get('tarifa/:tarifaId')
    findTarifaColumnById(@Param('tarifaId') tarifaId: string) {
        return this.tarifaColumnService.findByTarifaId(tarifaId);
    }

    @Put('update/:id')
    updateTarifaColumn(@Param('id') id: string, @Body() data: Partial<TarifaColumn>) {
        return this.tarifaColumnService.update(id, data);
    }

    @Delete(':id')
    async deleteColumn(@Param('id') id: string) {
        return this.tarifaColumnService.delete(id);
    }

}
