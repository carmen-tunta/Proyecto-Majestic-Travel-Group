import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Client } from '../clients/entities/client.entity';
import { CotizacionServicio } from './entities/cotizacion-servicio.entity';
import { CotizacionServicioComponente } from './entities/cotizacion-servicio-componente.entity';
import { Service } from '../services/entities/service.entity';
import { Component } from '../components/entities/component.entity';

@Injectable()
export class CotizacionService {
  constructor(
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepository: Repository<Cotizacion>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(CotizacionServicio)
    private readonly cotizacionServicioRepo: Repository<CotizacionServicio>,
    @InjectRepository(CotizacionServicioComponente)
    private readonly cotizacionServicioCompRepo: Repository<CotizacionServicioComponente>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Component)
    private readonly componentRepo: Repository<Component>,
  ) {}

  async create(createCotizacionDto: CreateCotizacionDto): Promise<Cotizacion> {
    const client = await this.clientRepository.findOne({ where: { id: createCotizacionDto.clienteId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    // Ensure numeroFile is assigned when not provided: sequential per year
    const anio = createCotizacionDto.anio;
    let numeroFile = createCotizacionDto.numeroFile;
    if (numeroFile == null) {
      const lastByYear = await this.cotizacionRepository
        .createQueryBuilder('c')
        .select('MAX(c.numeroFile)', 'max')
        .where('c.anio = :anio', { anio })
        .getRawOne<{ max: number | null }>();
      numeroFile = (lastByYear?.max || 0) + 1;
    }

    const cotizacion = this.cotizacionRepository.create({
      ...createCotizacionDto,
      numeroFile,
      cliente: client,
      fechaViaje: new Date(createCotizacionDto.fechaViaje),
    });
    return this.cotizacionRepository.save(cotizacion);
  }

  async findAll(): Promise<Cotizacion[]> {
    return this.cotizacionRepository.find({ relations: ['cliente'] });
  }

  async findOne(id: number): Promise<Cotizacion> {
    const cotizacion = await this.cotizacionRepository.findOne({ where: { id }, relations: ['cliente'] });
    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }
    return cotizacion;
  }

  async update(id: number, data: Partial<CreateCotizacionDto>): Promise<Cotizacion> {
    const cot = await this.findOne(id);
    // permitir fecha en formato amigable 'Jue 25 Dic 25' o ISO
    let fecha: Date | undefined;
    if (data.fechaViaje) {
      const tryDate = new Date(data.fechaViaje as any);
      if (!isNaN(tryDate.getTime())) fecha = tryDate; else fecha = undefined;
    }
    Object.assign(cot, {
      ...data,
      fechaViaje: fecha ?? cot.fechaViaje,
    } as any);
    return this.cotizacionRepository.save(cot);
  }

  // Agregar un servicio a una cotización
  async addService(cotizacionId: number, serviceId: number, _nota?: string, precio?: number): Promise<CotizacionServicio> {
    const cot = await this.findOne(cotizacionId);
    const service = await this.serviceRepo.findOne({ where: { id: serviceId }, relations: ['components'] });
    if (!service) throw new NotFoundException('Servicio no encontrado');
  const cs = this.cotizacionServicioRepo.create({ cotizacion: cot, service, precio: precio ?? 0 });
    const csSaved = await this.cotizacionServicioRepo.save(cs);

    // Si el servicio tiene componentes base, agregarlos automáticamente
    if (Array.isArray(service.components) && service.components.length > 0) {
      const items = service.components.map((c) =>
        this.cotizacionServicioCompRepo.create({ cotizacionServicio: csSaved, component: c })
      );
      await this.cotizacionServicioCompRepo.save(items);
    }

    const refreshed = await this.cotizacionServicioRepo.findOne({ where: { id: csSaved.id } });
    if (!refreshed) throw new NotFoundException('No se pudo refrescar el servicio agregado');
    return refreshed;
  }

  // Agregar componentes específicos de un servicio a la cotización
  async addComponentsToService(cotizacionServicioId: number, componentIds: number[]): Promise<CotizacionServicio> {
    const cs = await this.cotizacionServicioRepo.findOne({ where: { id: cotizacionServicioId }, relations: ['service'] });
    if (!cs) throw new NotFoundException('Relación servicio-cotización no encontrada');
    const comps = await this.componentRepo.find({ where: { id: In(componentIds) } });
    const items = comps.map(c => this.cotizacionServicioCompRepo.create({ cotizacionServicio: cs, component: c }));
    await this.cotizacionServicioCompRepo.save(items);
  const refreshed = await this.cotizacionServicioRepo.findOne({ where: { id: cs.id } });
  if (!refreshed) throw new NotFoundException('No se pudo refrescar el servicio agregado');
  return refreshed;
  }

  // Agregar un componente extra (sin pertenecer al catálogo base)
  async addExtraComponentToService(cotizacionServicioId: number, nombre: string, precio?: number) {
    const cs = await this.cotizacionServicioRepo.findOne({ where: { id: cotizacionServicioId } });
    if (!cs) throw new NotFoundException('Relación servicio-cotización no encontrada');
    const csc = this.cotizacionServicioCompRepo.create({
      cotizacionServicio: cs,
      component: null,
      isExtra: true,
      nombreExtra: nombre,
      precio: (precio ?? 0) as any,
    });
    return this.cotizacionServicioCompRepo.save(csc);
  }

  // Obtener detalle de una cotización con servicios y componentes
  async getDetail(cotizacionId: number) {
    const cot = await this.findOne(cotizacionId);
    const servicios = await this.cotizacionServicioRepo.find({ where: { cotizacion: { id: cotizacionId } as any } });
    return { ...cot, servicios };
  }

  // Actualizar nota y/o precio de un servicio dentro de la cotización
  async updateServiceItem(csId: number, data: { nota?: string; precio?: number }) {
    const cs = await this.cotizacionServicioRepo.findOne({ where: { id: csId } });
    if (!cs) throw new NotFoundException('Servicio de cotización no encontrado');
    if (typeof data.precio !== 'undefined') cs.precio = Number(data.precio) as any;
    return this.cotizacionServicioRepo.save(cs);
  }

  // Actualizar nota y/o precio de un componente dentro del servicio de la cotización
  async updateServiceComponentItem(cscId: number, data: { nota?: string; precio?: number }) {
    const csc = await this.cotizacionServicioCompRepo.findOne({ where: { id: cscId } });
    if (!csc) throw new NotFoundException('Componente de servicio de cotización no encontrado');
    if (typeof data.nota !== 'undefined') csc.nota = data.nota as any;
    if (typeof data.precio !== 'undefined') csc.precio = Number(data.precio) as any;
    return this.cotizacionServicioCompRepo.save(csc);
  }

  async deleteServiceItem(csId: number) {
    const exists = await this.cotizacionServicioRepo.findOne({ where: { id: csId } });
    if (!exists) throw new NotFoundException('Servicio de cotización no encontrado');
    await this.cotizacionServicioRepo.delete({ id: csId });
    return { success: true };
  }

  async deleteServiceComponentItem(cscId: number) {
    const exists = await this.cotizacionServicioCompRepo.findOne({ where: { id: cscId } });
    if (!exists) throw new NotFoundException('Componente de servicio de cotización no encontrado');
    await this.cotizacionServicioCompRepo.delete({ id: cscId });
    return { success: true };
  }
}
