import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceComponent } from './entities/service-component.entity';
import { Component } from '../components/entities/component.entity';
import { Portada } from './entities/portada.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceComponent)
    private serviceComponentRepository: Repository<ServiceComponent>,
    @InjectRepository(Component)
    private componentRepository: Repository<Component>,
    @InjectRepository(Portada)
    private portadaRepository: Repository<Portada>,
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
    // 2) asignar componentes permitiendo duplicados usando la entidad intermedia
    if (componentIds && componentIds.length > 0) {
      for (const componentId of componentIds) {
        const serviceComponent = this.serviceComponentRepository.create({
          servicesId: saved.id,
          componentsId: componentId
        });
        await this.serviceComponentRepository.save(serviceComponent);
      }
    }
    // 3) devolver con relaciones
    return (await this.findOne(saved.id))!;
  }

  async findAll(): Promise<Service[]> {
    const services = await this.serviceRepository.find({ relations: ['images'] });
    
    // Cargar componentes manualmente con duplicados permitidos usando la entidad intermedia
    for (const service of services) {
      const serviceComponents = await this.serviceComponentRepository.find({
        where: { servicesId: service.id },
        relations: ['component'],
        order: { id: 'ASC' }
      });
      // Incluir el serviceComponentId en cada componente para poder eliminarlo específicamente
      service.components = serviceComponents.map(sc => ({
        ...sc.component,
        _serviceComponentId: sc.id
      }));
    }
    
    return services;
  }

  async findOne(id: number): Promise<Service | null> {
    const service = await this.serviceRepository.findOne({ 
      where: { id }, 
      relations: ['images'] 
    });
    
    if (!service) return null;
    
    // Cargar componentes manualmente con duplicados permitidos usando la entidad intermedia
    const serviceComponents = await this.serviceComponentRepository.find({
      where: { servicesId: id },
      relations: ['component'],
      order: { id: 'ASC' }
    });
    // Incluir el serviceComponentId en cada componente para poder eliminarlo específicamente
    service.components = serviceComponents.map(sc => ({
      ...sc.component,
      _serviceComponentId: sc.id
    }));
    
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
      await this.serviceComponentRepository.delete({ servicesId: id });
      
      // Crear nuevas relaciones permitiendo duplicados
      if (componentIds.length > 0) {
        for (const componentId of componentIds) {
          const serviceComponent = this.serviceComponentRepository.create({
            servicesId: id,
            componentsId: componentId
          });
          await this.serviceComponentRepository.save(serviceComponent);
        }
      }
    }

    return this.findOne(id);
  }


  async remove(id: number): Promise<void> {
    // Las relaciones se eliminarán automáticamente por CASCADE
    await this.serviceRepository.delete(id);
  }

  // SEARCH - Buscar servicios por nombre
  async searchByName(name: string): Promise<Service[]> {
    const cleanName = name.trim().toLowerCase();
    const services = await this.serviceRepository.createQueryBuilder('service')
      .where('LOWER(TRIM(service.name)) LIKE :name', { name: `%${cleanName}%` })
      .leftJoinAndSelect('service.images', 'images')
      .getMany();
    
    // Cargar componentes manualmente con duplicados
    for (const service of services) {
      const serviceComponents = await this.serviceComponentRepository.find({
        where: { servicesId: service.id },
        relations: ['component'],
        order: { id: 'ASC' }
      });
      // Incluir el serviceComponentId en cada componente para poder eliminarlo específicamente
      service.components = serviceComponents.map(sc => ({
        ...sc.component,
        _serviceComponentId: sc.id
      }));
    }
    
    return services;
  }

  async removeComponentFromService(serviceId: number, componentId: number): Promise<void> {
    // Eliminar solo la primera ocurrencia del componente
    const serviceComponent = await this.serviceComponentRepository.findOne({
      where: { servicesId: serviceId, componentsId: componentId }
    });
    if (serviceComponent) {
      await this.serviceComponentRepository.remove(serviceComponent);
    }
  }

  async removeServiceComponentById(serviceComponentId: number): Promise<void> {
    // Eliminar una ocurrencia específica por su ID único
    await this.serviceComponentRepository.delete(serviceComponentId);
  }

  async addComponentsToService(serviceId: number, componentIds: number[]): Promise<Service | null> {
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (!service) return null;
    
    // Agregar componentes permitiendo duplicados
    for (const componentId of componentIds) {
      const serviceComponent = this.serviceComponentRepository.create({
        servicesId: serviceId,
        componentsId: componentId
      });
      await this.serviceComponentRepository.save(serviceComponent);
    }
    
    return this.findOne(serviceId);
  }
}
