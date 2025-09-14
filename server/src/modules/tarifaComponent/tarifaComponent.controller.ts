import { Body, Controller, Get, Param, Post, Put, Query, BadRequestException, Delete } from '@nestjs/common';
import { TarifaComponentService } from './tarifaComponent.service';

@Controller('tarifa-component')
export class TarifaComponentController {
    constructor(private readonly tarifaComponentService: TarifaComponentService) { }

    @Post()
    create(@Body() createTarifaComponentDto: any) {
        return this.tarifaComponentService.create(createTarifaComponentDto);
    }

    @Get()
    findAll() {
        return this.tarifaComponentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tarifaComponentService.findById(id);
    }

    @Put('update/:id')
    update(@Param('id') id: string, @Body() updateTarifaComponentDto: any) {
        return this.tarifaComponentService.update(id, updateTarifaComponentDto);
    }

    @Get('tarifa/:tarifaId')
    async findByTarifaId(@Param('tarifaId') tarifaId: string) {
        const idNum = Number(tarifaId);
        if (isNaN(idNum)) {
            throw new BadRequestException('Invalid tarifaId');
        }
        return this.tarifaComponentService.findByTarifaId(idNum);
    }

    @Delete('/tarifa/:tarifaId/component/:componentId')
    remove(@Param('tarifaId') tarifaId: string, @Param('componentId') componentId: string) {
        return this.tarifaComponentService.remove(tarifaId, componentId);
    }
}
