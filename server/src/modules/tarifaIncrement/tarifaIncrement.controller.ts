import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { TarifaIncrementService } from "./tarifaIncrement.service";
import { TarifaIncrement } from "./entities/increment.entity";

@Controller('tarifa-increment')
export class TarifaIncrementController {
    constructor(private readonly tarifaIncrementService: TarifaIncrementService) {}

    @Post()
    create(@Body() body: Partial<TarifaIncrement>) {
        return this.tarifaIncrementService.create(body);
    }

    @Get('tarifa/:tarifaId')
    findByTarifaId(@Param('tarifaId') tarifaId: string) {
        const idNum = Number(tarifaId);
        if (isNaN(idNum)) {
            throw new BadRequestException('Invalid tarifaId');
        }
        return this.tarifaIncrementService.findByTarifaId(idNum);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.tarifaIncrementService.delete(id);
    }

    @Put('update/:id')
    update(@Param('id') id: string, @Body() data: Partial<TarifaIncrement>) {
        return this.tarifaIncrementService.update(id, data);
    }

}