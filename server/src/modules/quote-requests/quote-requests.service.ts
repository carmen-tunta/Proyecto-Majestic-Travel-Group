import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DeepPartial } from 'typeorm';
import { QuoteRequest } from './entities/quote-request.entity';
import { QuoteRequestService as QrServiceEntity } from './entities/quote-request-service.entity';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { UpdateQuoteRequestDto } from './dto/update-quote-request.dto';
import { Client } from '../clients/entities/client.entity';
import { Service } from '../services/entities/service.entity';
import { AssignmentService } from './services/assignment.service';

@Injectable()
export class QuoteRequestsService {
  constructor(
    @InjectRepository(QuoteRequest) private qrRepo: Repository<QuoteRequest>,
    @InjectRepository(QrServiceEntity) private qrsRepo: Repository<QrServiceEntity>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
    @Inject(forwardRef(() => AssignmentService))
    private assignmentService: AssignmentService,
  ) {}

  async createFromPublic(dto: CreateQuoteRequestDto): Promise<QuoteRequest> {
    // 1) Find or create client by email
    let client: Client | null = await this.clientRepo.findOne({ where: { correo: dto.email } });
    if (!client) {
      const clientPartial: DeepPartial<Client> = {
        nombre: dto.passengerName,
        pais: dto.countryName || '',
        ciudad: '',
        direccion: '',
        whatsapp: `${dto.countryCode} ${dto.whatsapp}`,
        correo: dto.email,
        // Campos requeridos en entidad Client que no son relevantes aquí
        fechaNacimiento: new Date('1970-01-01'),
        lenguaNativa: dto.countryName || '', // Usar el país como nacionalidad
        tipoDocumento: 'QR',
        numeroDocumento: `QR-${Date.now()}`,
        mercado: '',
        rubro: '',
        genero: 'No especificado',
        fechaRegistro: new Date(),
        estado: 'Registrado',
      };
      const clientEntity = this.clientRepo.create(clientPartial);
      client = await this.clientRepo.save(clientEntity);
    }

    // 2) Create QuoteRequest
    const qrEntity = this.qrRepo.create({
      client: client as Client,
      passengerName: dto.passengerName,
      email: dto.email,
      countryCode: dto.countryCode,
      whatsapp: dto.whatsapp,
      travelDate: dto.travelDate ? new Date(dto.travelDate) : null,
      message: dto.message || null,
      source: 'public_web',
      status: 'recibido',
    });
    const savedQr = await this.qrRepo.save(qrEntity);

    // 3) Attach services
    if (dto.serviceIds && dto.serviceIds.length > 0) {
      const services = await this.serviceRepo.findBy({ id: In(dto.serviceIds) });
      for (const s of services) {
        const linkPartial: DeepPartial<QrServiceEntity> = { quoteRequest: savedQr, service: s };
        const link = this.qrsRepo.create(linkPartial);
        await this.qrsRepo.save(link);
      }
    }

    // 4) Asignar automáticamente al agente disponible
    try {
      const assignedRequest = await this.assignmentService.assignRequestToAgent(savedQr.id);
      return assignedRequest;
    } catch (error) {
      console.error('Error en asignación automática:', error);
      // Si falla la asignación, retornar la solicitud sin asignar
      return this.findOne(savedQr.id);
    }
  }

  async findOne(id: number): Promise<QuoteRequest> {
    const qr = await this.qrRepo.findOne({ 
      where: { id }, 
      relations: ['services', 'services.service', 'client', 'agent'] 
    });
    if (!qr) throw new NotFoundException('QuoteRequest not found');
    return qr;
  }

  async findAll(page = 0, limit = 15) {
    const [data, total] = await this.qrRepo.findAndCount({
      relations: ['client', 'services', 'services.service', 'agent'],
      skip: page * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    
    return { 
      data, 
      total, 
      page, 
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: (page + 1) * limit < total,
      hasPreviousPage: page > 0
    };
  }

  async update(id: number, dto: UpdateQuoteRequestDto): Promise<QuoteRequest> {
    // 1) Verificar que existe la solicitud
    const existingRequest = await this.qrRepo.findOne({ 
      where: { id },
      relations: ['client', 'services', 'services.service']
    });
    
    if (!existingRequest) {
      throw new NotFoundException(`QuoteRequest with ID ${id} not found`);
    }

    // 2) Preparar datos para actualizar
    const updateData: Partial<QuoteRequest> = {};
    
    if (dto.passengerName !== undefined) updateData.passengerName = dto.passengerName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.countryCode !== undefined) updateData.countryCode = dto.countryCode;
    if (dto.whatsapp !== undefined) updateData.whatsapp = dto.whatsapp;
    if (dto.travelDate !== undefined) updateData.travelDate = dto.travelDate ? new Date(dto.travelDate) : null;
    if (dto.message !== undefined) updateData.message = dto.message;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.agentId !== undefined) updateData.agentId = dto.agentId;
    if (dto.source !== undefined) updateData.source = dto.source;

    // 3) Actualizar la solicitud
    await this.qrRepo.update(id, updateData);

    // 4) Retornar la solicitud actualizada
    return this.findOne(id);
  }
}


