import { Body, Controller, Get, Param, Post, Put, Query, BadRequestException } from '@nestjs/common';
import { TarifarioService } from './tarifario.service';
import { Tarifario } from './entities/tarifario.entity';


@Controller('tarifario')
export class TarifarioController {
    constructor(private readonly tarifarioService: TarifarioService) { }

    @Get()
    getAllTarifas() {
        return this.tarifarioService.findAll();
    }

    @Post()
    createTarifa(@Body() data: Partial<Tarifario>) {
        return this.tarifarioService.create(data);
    }

    @Get(':id')
    getTarifaById(@Param('id') id: string) {
        return this.tarifarioService.findById(id);
    }   

    @Put('update/:id')
    updateTarifa(@Param('id') id: string, @Body() data: Partial<Tarifario>) {
        return this.tarifarioService.update(id, data);
    }
}


