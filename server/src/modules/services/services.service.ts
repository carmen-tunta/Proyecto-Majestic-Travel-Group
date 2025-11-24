import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { Service } from './entities/service.entity';
import { Component } from '../components/entities/component.entity';
import { Portada } from './entities/portada.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Component)
    private componentRepository: Repository<Component>,
    @InjectRepository(Portada)
    private portadaRepository: Repository<Portada>,
    private dataSource: DataSource,
  ) { }

  async create(data: Partial<Service> & { componentIds?: number[] }): Promise<Service> {
    const { componentIds, ...serviceData } = data;
    // 1) guardar el servicio primero para obtener ID
    const saved = await this.serviceRepository.save(this.serviceRepository.create(serviceData));
    
    try {
      const defaultPortada = this.portadaRepository.create({
        titulo: '', // Título vacío
        imagenCentro: '', // Sin imagen
        serviceId: saved.id // Asociar con el servicio recién creado
      });
      await this.portadaRepository.save(defaultPortada);
      console.log(`Portada creada automáticamente para servicio ID: ${saved.id}`);
    } catch (error) {
      console.warn(`Error al crear portada automática para servicio ${saved.id}:`, error);
      // No fallar el proceso si la portada no se puede crear
    }
    // 2) asignar componentes permitiendo duplicados mediante INSERT directo
    if (componentIds && componentIds.length > 0) {
      for (const componentId of componentIds) {
        await this.dataSource.query(
          'INSERT INTO service_components (servicesId, componentsId) VALUES (?, ?)',
          [saved.id, componentId]
        );
      }
    }
    // 3) devolver con relaciones
    return (await this.findOne(saved.id))!;
  }

  async findAll(): Promise<Service[]> {
    const services = await this.serviceRepository.find({ relations: ['images'] });
    
    // Cargar componentes manualmente con duplicados permitidos
    for (const service of services) {
      const rows = await this.dataSource.query(
        `SELECT c.* FROM service_components sc 
         INNER JOIN components c ON sc.componentsId = c.id 
         WHERE sc.servicesId = ? 
         ORDER BY sc.id`,
        [service.id]
      );
      service.components = rows;
    }
    
    return services;
  }

  async findOne(id: number): Promise<Service | null> {
    const service = await this.serviceRepository.findOne({ 
      where: { id }, 
      relations: ['images'] 
    });
    
    if (!service) return null;
    
    // Cargar componentes manualmente con duplicados permitidos
    const rows = await this.dataSource.query(
      `SELECT c.* FROM service_components sc 
       INNER JOIN components c ON sc.componentsId = c.id 
       WHERE sc.servicesId = ? 
       ORDER BY sc.id`,
      [id]
    );
    service.components = rows;
    
    return service;
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

    // Actualizar componentes si se envía componentIds (permitiendo duplicados)
    if (componentIds !== undefined) {
      // Eliminar todas las relaciones existentes
      await this.dataSource.query(
        'DELETE FROM service_components WHERE servicesId = ?',
        [id]
      );
      
      // Crear nuevas relaciones permitiendo duplicados
      if (componentIds.length > 0) {
        for (const componentId of componentIds) {
          await this.dataSource.query(
            'INSERT INTO service_components (servicesId, componentsId) VALUES (?, ?)',
            [id, componentId]
          );
        }
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
