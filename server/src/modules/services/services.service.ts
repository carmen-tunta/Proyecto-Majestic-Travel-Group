import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { Component } from '../components/entities/component.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Component)
    private componentRepository: Repository<Component>,
  ) { }

  async create(data: Partial<Service> & { componentIds?: number[] }): Promise<Service> {
    const { componentIds, ...serviceData } = data;
    // 1) guardar el servicio primero para obtener ID
    const saved = await this.serviceRepository.save(this.serviceRepository.create(serviceData));
    // 2) asignar componentes (lado dueño: Service con @JoinTable)
    if (componentIds && componentIds.length > 0) {
      const components = await this.componentRepository.findBy({ id: In(componentIds) });
      saved.components = components;
      await this.serviceRepository.save(saved);
    }
    // 3) devolver con relaciones
    return (await this.findOne(saved.id))!;
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({ relations: ['components', 'images'] });
  }

  async findOne(id: number): Promise<Service | null> {
    return this.serviceRepository.findOne({ where: { id }, relations: ['components', 'images'] });
  }

  async update(id: number, data: Partial<Service> & { componentIds?: number[] }): Promise<Service | null> {
    const { componentIds, ...serviceData } = data;
  const metadata = this.serviceRepository.metadata;
    const columnsOnly = Object.keys(serviceData).reduce((obj, key) => {
  const column = metadata.findColumnWithPropertyName(key);
      if (column) obj[key] = serviceData[key];
      return obj;
    }, {} as Partial<Service>);
    await this.serviceRepository.update(id, columnsOnly);

    // Actualizar componentes si se envía componentIds
    if (componentIds) {
      const service = await this.serviceRepository.findOne({ where: { id }, relations: ['components'] });
      if (service) {
        const newComponents = await this.componentRepository.findBy({ id: In(componentIds) });
        service.components = newComponents;
        await this.serviceRepository.save(service);
      }
    }

    return this.findOne(id);
  }


  async remove(id: number): Promise<void> {
    // Desasociar los componentes (ManyToMany) antes de eliminar el servicio
    const service = await this.serviceRepository.findOne({ where: { id }, relations: ['components'] });
    if (service) {
      service.components = [];
      await this.serviceRepository.save(service);
      await this.serviceRepository.delete(id);
    } else {
      await this.serviceRepository.delete(id);
    }
  }

  // SEARCH - Buscar servicios por nombre
  async searchByName(name: string): Promise<Service[]> {
    const cleanName = name.trim().toLowerCase();
    return await this.serviceRepository.createQueryBuilder('service')
      .where('LOWER(TRIM(service.name)) LIKE :name', { name: `%${cleanName}%` })
      .leftJoinAndSelect('service.components', 'component')
      .leftJoinAndSelect('service.images', 'images')
      .getMany();
  }

  async removeComponentFromService(serviceId: number, componentId: number): Promise<void> {
    const service = await this.serviceRepository.findOne({ where: { id: serviceId }, relations: ['components'] });
    if (!service) return;
    service.components = (service.components || []).filter(c => c.id !== componentId);
    await this.serviceRepository.save(service);
  }

  async addComponentsToService(serviceId: number, componentIds: number[]): Promise<Service | null> {
    const service = await this.serviceRepository.findOne({ where: { id: serviceId }, relations: ['components'] });
    if (!service) return null;
    const components = await this.componentRepository.findBy({ id: In(componentIds) });
    const existing = service.components || [];
    const map = new Map<number, Component>(existing.map(c => [c.id, c]));
    for (const c of components) map.set(c.id, c);
    service.components = Array.from(map.values());
    await this.serviceRepository.save(service);
    return this.findOne(serviceId);
  }
}
