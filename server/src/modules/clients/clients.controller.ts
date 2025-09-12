import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: any): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get('search')
  searchByNombre(@Query('nombre') nombre: string): Promise<Client[]> {
    return this.clientsService.searchByNombre(nombre);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Client | null> {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateClientDto: any): Promise<Client | null> {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<{ success: boolean }> {
    return this.clientsService.remove(id).then(success => ({ success }));
  }
}