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

  async create(createClientDto: any): Promise<Client> {
    const client = this.clientsRepository.create(createClientDto);
    const savedClient = await this.clientsRepository.save(client);
    return Array.isArray(savedClient) ? savedClient[0] : savedClient;
  }

  async findAll(): Promise<Client[]> {
    return await this.clientsRepository.find();
  }

  async findOne(id: number): Promise<Client | null> {
    return await this.clientsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateClientDto: any): Promise<Client | null> {
    await this.clientsRepository.update(id, updateClientDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.clientsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}