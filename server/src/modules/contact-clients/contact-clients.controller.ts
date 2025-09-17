import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactClientsService } from './contact-clients.service';
import { clientesContact } from './entities/contact.entity';

@Controller('contact-clients')
export class ContactClientsController {
  constructor(private readonly contactClientsService: ContactClientsService) {}

  @Post()
  create(@Body() createContactDto: Partial<clientesContact>) {
    return this.contactClientsService.create(createContactDto);
  }

  @Get()
  findAll() {
    return this.contactClientsService.findAll();
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.contactClientsService.findByClientId(+clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactClientsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: Partial<clientesContact>) {
    return this.contactClientsService.update(+id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactClientsService.remove(+id);
  }
}
