import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: {
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
    const client = this.clientsRepository.create(createClientDto);
    return await this.clientsRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return await this.clientsRepository.find();
  }

  async findById(id: number): Promise<Client | null> {
    return await this.clientsRepository.findOne({ where: { id } });
  }

  async findByCorreo(correo: string): Promise<Client | null> {
    return await this.clientsRepository.findOne({ where: { correo } });
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<Client | null> {
    return await this.clientsRepository.findOne({ where: { numeroDocumento } });
  }

  async update(id: number, updateClientDto: Partial<{
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
  }>): Promise<Client | null> {
    await this.clientsRepository.update(id, updateClientDto);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.clientsRepository.delete(id);
    return result.affected > 0;
  }

  async searchByNombre(nombre: string): Promise<Client[]> {
    return await this.clientsRepository
      .createQueryBuilder('client')
      .where('client.nombre LIKE :nombre', { nombre: `%${nombre}%` })
      .getMany();
  }

  async searchByMercado(mercado: string): Promise<Client[]> {
    return await this.clientsRepository.find({ where: { mercado } });
  }

  async searchByRubro(rubro: string): Promise<Client[]> {
    return await this.clientsRepository.find({ where: { rubro } });
  }
}
