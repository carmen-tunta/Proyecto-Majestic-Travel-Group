import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { Component } from '../components/entities/component.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Component)
    private componentRepository: Repository<Component>,
  ) {}

  async create(data: Partial<Service> & { componentIds?: number[] }): Promise<Service> {
    const { componentIds, ...serviceData } = data;
    const service = this.serviceRepository.create(serviceData);

    if (componentIds && componentIds.length > 0) {
      const components = await this.componentRepository.findByIds(componentIds);
      service.components = components;
    }

    return this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({ relations: ['components'] });
  }

  async findOne(id: number): Promise<Service | null> {
    return this.serviceRepository.findOne({ where: { id }, relations: ['components'] });
  }

  async update(id: number, data: Partial<Service>): Promise<Service | null> {
    await this.serviceRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.serviceRepository.delete(id);
  }
}
