import { BadRequestException, Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { Proveedores } from './entities/proveedores.entity';

@Controller('proveedores')
export class ProveedoresController {
    constructor(private readonly proveedoresService: ProveedoresService) { }

   @Get()
   getAllProveedores() {
       return this.proveedoresService.findAll();
   }

   @Post()
   createProveedor(@Body() data: Partial<Proveedores>) {
       return this.proveedoresService.create(data);
   }

   @Get(':id')
   getProveedorById(@Param('id') id: string) {
    const idNum = Number(id);
    if (isNaN(idNum)) {
        throw new BadRequestException('El id recibido no es válido');
    }
       return this.proveedoresService.findById(id);
   }

   @Put('update/:id')
   updateProveedor(@Param('id') id: string, @Body() data: Partial<Proveedores>) {
       return this.proveedoresService.update(id, data);
   }

   @Get('component/:idc/pax/:pax')
    getProveedorByComponentAndPax(@Param('idc') componentId: string, @Param('pax') pax: string) {
        return this.proveedoresService.findByComponentIdAndPax(componentId, Number(pax));
    }
}