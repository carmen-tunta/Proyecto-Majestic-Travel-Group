import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async createClient(@Body() createClientDto: {
    nombre: string;
    pais: string;
    ciudad: string;
    direccion: string;
    whatsapp: string;
    correo: string;
    fechaNacimiento: Date;
    lenguaNativa: string;
    tipoDocumento: string;
    numeroDocumento: string;
    mercado: string;
    rubro: string;
    genero: 'Masculino' | 'Femenino';
    fechaRegistro: Date;
  }): Promise<Client> {
    return await this.clientsService.create(createClientDto);
  }

  @Get()
  async getAllClients(): Promise<Client[]> {
    return await this.clientsService.findAll();
  }

  @Get('search')
  async searchClients(
    @Query('nombre') nombre?: string,
    @Query('mercado') mercado?: string,
    @Query('rubro') rubro?: string,
  ): Promise<Client[]> {
    if (nombre) {
      return await this.clientsService.searchByNombre(nombre);
    }
    if (mercado) {
      return await this.clientsService.searchByMercado(mercado);
    }
    if (rubro) {
      return await this.clientsService.searchByRubro(rubro);
    }
    return await this.clientsService.findAll();
  }

  @Get(':id')
  async getClientById(@Param('id') id: number): Promise<Client | null> {
    return await this.clientsService.findById(id);
  }

  @Get('correo/:correo')
  async getClientByCorreo(@Param('correo') correo: string): Promise<Client | null> {
    return await this.clientsService.findByCorreo(correo);
  }

  @Get('documento/:numeroDocumento')
  async getClientByDocumento(@Param('numeroDocumento') numeroDocumento: string): Promise<Client | null> {
    return await this.clientsService.findByNumeroDocumento(numeroDocumento);
  }

  @Put(':id')
  async updateClient(
    @Param('id') id: number,
    @Body() updateClientDto: Partial<{
      nombre: string;
      pais: string;
      ciudad: string;
      direccion: string;
      whatsapp: string;
      correo: string;
      fechaNacimiento: Date;
      lenguaNativa: string;
      tipoDocumento: string;
      numeroDocumento: string;
      mercado: string;
      rubro: string;
      genero: 'Masculino' | 'Femenino';
      fechaRegistro: Date;
    }>,
  ): Promise<Client | null> {
    return await this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: number): Promise<{ success: boolean }> {
    const success = await this.clientsService.delete(id);
    return { success };
  }
}
