import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Component } from './entities/component.entity';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectRepository(Component)
    private componentsRepository: Repository<Component>,
  ) { }

  // CREATE - Crear un nuevo componente
  async create(createComponentDto: {
    componentName: string;
    serviceType: string;
    description?: string;
  }): Promise<Component> {
    const component = this.componentsRepository.create(createComponentDto);
    return await this.componentsRepository.save(component);
  }

  // READ - Obtener todos los componentes
  async findAll(): Promise<Component[]> {
    return await this.componentsRepository.find({
      order: { id: 'ASC' }
    });
  }

  // READ - Obtener componentes con paginación
  async findAllPaginated(page: number, limit: number): Promise<{
    data: Component[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.componentsRepository.findAndCount({
      order: { id: 'ASC' },
      skip: page * limit,
      take: limit
    });

    return {
      data,
      total,
      page,
      limit
    };
  }

  // READ - Obtener componente por ID
  async findOne(id: number): Promise<Component> {
    const component = await this.componentsRepository.findOne({
      where: { id }
    });

    if (!component) {
      throw new NotFoundException(`Componente con ID ${id} no encontrado`);
    }

    return component;
  }

  // READ - Obtener componentes activos
  async findActive(): Promise<Component[]> {
    return await this.componentsRepository.find({
      where: { isActive: true },
      order: { componentName: 'ASC' }
    });
  }

  // READ - Buscar componentes por tipo de servicio
  async findByServiceType(serviceType: string): Promise<Component[]> {
    return await this.componentsRepository.find({
      where: { serviceType },
      order: { componentName: 'ASC' }
    });
  }

  // UPDATE - Actualizar un componente
  async update(id: number, updateComponentDto: {
    componentName?: string;
    serviceType?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Component> {
    const component = await this.findOne(id);

    Object.assign(component, updateComponentDto);
    return await this.componentsRepository.save(component);
  }

  // DELETE - Eliminar un componente (soft delete)
  async remove(id: number): Promise<{ message: string }> {
    const component = await this.findOne(id);

    component.isActive = false;
    await this.componentsRepository.save(component);

    return { message: 'Componente desactivado exitosamente' };
  }

  // DELETE - Eliminar permanentemente un componente
  async delete(id: number): Promise<{ message: string }> {
    const component = await this.findOne(id);

    await this.componentsRepository.remove(component);

    return { message: 'Componente eliminado permanentemente' };
  }

  // SEARCH - Buscar componentes por nombre
  async searchByName(name: string): Promise<Component[]> {
    return await this.componentsRepository.createQueryBuilder('component')
      .where('component.componentName LIKE :name', { name: `%${name}%` })
      .getMany();
  }
}
