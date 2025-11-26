import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Client } from '../clients/entities/client.entity';
import { CotizacionServicio } from './entities/cotizacion-servicio.entity';
import { CotizacionServicioComponente } from './entities/cotizacion-servicio-componente.entity';
import { Service } from '../services/entities/service.entity';
import { ServiceComponent } from '../services/entities/service-component.entity';
import { Component } from '../components/entities/component.entity';
import { Proveedores } from '../proveedores/entities/proveedores.entity';
import { User } from '../users/entities/user.entity';

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
    @InjectRepository(ServiceComponent)
    private readonly serviceComponentRepo: Repository<ServiceComponent>,
    @InjectRepository(Component)
    private readonly componentRepo: Repository<Component>,
    @InjectRepository(Proveedores)
    private readonly proveedoresRepo: Repository<Proveedores>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createCotizacionDto: CreateCotizacionDto, userId?: number): Promise<Cotizacion> {
    const client = await this.clientRepository.findOne({ where: { id: createCotizacionDto.clienteId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Buscar el usuario si se proporciona userId
    let user: User | undefined = undefined;
    if (userId) {
      const foundUser = await this.userRepo.findOne({ where: { id: userId } });
      if (foundUser) {
        user = foundUser;
      }
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

    const fechaViajeStr = this.toDateOnly(createCotizacionDto.fechaViaje);
    const fechaLlegadaStr = createCotizacionDto.fechaLlegada ? this.toDateOnly(createCotizacionDto.fechaLlegada) : null;
    const fechaSalidaStr = createCotizacionDto.fechaSalida ? this.toDateOnly(createCotizacionDto.fechaSalida) : null;
    
    const cotizacion = this.cotizacionRepository.create({
      ...createCotizacionDto,
      numeroFile,
      cliente: client,
      fechaViaje: fechaViajeStr as any,
      fechaLlegada: fechaLlegadaStr as any,
      fechaSalida: fechaSalidaStr as any,
      ...(user && { creadoPor: user }),
    });
    
    return this.cotizacionRepository.save(cotizacion);
  }

  async findAll(): Promise<Cotizacion[]> {
    return this.cotizacionRepository.find({ relations: ['cliente', 'registroPagos', 'creadoPor', 'pasajeros'] });
  }

  async findOne(id: number): Promise<Cotizacion> {
    const cotizacion = await this.cotizacionRepository.findOne({ where: { id }, relations: ['cliente', 'creadoPor', 'pasajeros'] });
    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }
    return cotizacion;
  }

  async update(id: number, data: Partial<CreateCotizacionDto>): Promise<Cotizacion> {
    const cot = await this.findOne(id);
    // Permitir fecha en 'YYYY-MM-DD' o ISO; guardar como date-only string
    let fechaViajeStr: string | undefined;
    let fechaLlegadaStr: string | undefined;
    let fechaSalidaStr: string | undefined;
    
    if (data.fechaViaje) {
      fechaViajeStr = this.toDateOnly(data.fechaViaje as any);
    }
    if (data.fechaLlegada) {
      fechaLlegadaStr = this.toDateOnly(data.fechaLlegada as any);
    }
    if (data.fechaSalida) {
      fechaSalidaStr = this.toDateOnly(data.fechaSalida as any);
    }
    
    Object.assign(cot, {
      ...data,
      fechaViaje: (fechaViajeStr ?? (cot.fechaViaje as any)),
      fechaLlegada: (fechaLlegadaStr ?? (cot.fechaLlegada as any)),
      fechaSalida: (fechaSalidaStr ?? (cot.fechaSalida as any)),
    } as any);
    return this.cotizacionRepository.save(cot);
  }

  // Convierte entrada a 'YYYY-MM-DD' en zona LOCAL
  private toDateOnly(input: string | Date): string {
    if (!input) return '';
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    const d = new Date(input);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Agregar un servicio a una cotización
  async addService(cotizacionId: number, serviceId: number, _nota?: string, precio?: number): Promise<CotizacionServicio> {
    const cot = await this.findOne(cotizacionId);
    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    
    // Cargar componentes manualmente con duplicados permitidos usando la entidad intermedia
    const serviceComponents = await this.serviceComponentRepo.find({
      where: { servicesId: serviceId },
      relations: ['component'],
      order: { id: 'ASC' }
    });
    
    const cs = this.cotizacionServicioRepo.create({ cotizacion: cot, service, precio: precio ?? 0 });
    const csSaved = await this.cotizacionServicioRepo.save(cs);

    // Si el servicio tiene componentes base, agregarlos automáticamente (incluyendo duplicados)
    if (serviceComponents.length > 0) {
      const items = serviceComponents.map((sc) =>
        this.cotizacionServicioCompRepo.create({ cotizacionServicio: csSaved, component: sc.component })
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
    const servicios = await this.cotizacionServicioRepo.find({ 
      where: { cotizacion: { id: cotizacionId } as any },
      relations: ['service', 'componentes', 'componentes.component', 'componentes.proveedor']
    });
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
  async updateServiceComponentItem(cscId: number, data: { nota?: string; precio?: number; scheduledAt?: string | null }) {
    const csc = await this.cotizacionServicioCompRepo.findOne({ where: { id: cscId } });
    if (!csc) throw new NotFoundException('Componente de servicio de cotización no encontrado');
    if (typeof data.nota !== 'undefined') csc.nota = data.nota as any;
    if (typeof data.precio !== 'undefined') csc.precio = Number(data.precio) as any;
    if (typeof data.scheduledAt !== 'undefined') {
      csc.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }
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

  // Asignar proveedor a un componente del servicio y opcionalmente guardar el precio total calculado
  async assignProviderToComponent(cscId: number, proveedorId: number, precioTotal?: number, isShared?: boolean) {
    const csc = await this.cotizacionServicioCompRepo.findOne({ where: { id: cscId } });
    if (!csc) throw new NotFoundException('Componente de servicio de cotización no encontrado');
    const proveedor = await this.proveedoresRepo.findOne({ where: { id: proveedorId } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    (csc as any).proveedor = proveedor;
    if (typeof precioTotal !== 'undefined') {
      csc.precio = Number(precioTotal) as any;
    }
    if (typeof isShared !== 'undefined') {
      csc.isShared = !!isShared;
    }
    return this.cotizacionServicioCompRepo.save(csc);
  }
}
