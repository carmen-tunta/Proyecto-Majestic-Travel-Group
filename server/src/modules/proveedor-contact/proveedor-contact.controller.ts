import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProveedorContactService } from './proveedor-contact.service';
import { ProveedorContact } from './entities/proveedor-contact.entity';

@Controller('proveedores/contact')
export class ProveedorContactController {
    constructor(private readonly contactService: ProveedorContactService) { }


    @Post()
    createContact(@Body() data: Partial<ProveedorContact>) {
        return this.contactService.create(data);
    }

    @Get(':id')
    getContactById(@Param('id') id: string) {
        return this.contactService.findById(id);
    }

    @Get('proveedor/:proveedorId')
    async getByProveedorId(@Param('proveedorId') proveedorId: string) {
        return this.contactService.findByProveedorId(Number(proveedorId));
    }

    @Put('update/:id')
    updateContact(@Param('id') id: string, @Body() data: Partial<ProveedorContact>) {
        return this.contactService.update(id, data);
    }

    @Delete(':id')
    deleteContact(@Param('id') id: string) {
        return this.contactService.delete(id);
    }
}