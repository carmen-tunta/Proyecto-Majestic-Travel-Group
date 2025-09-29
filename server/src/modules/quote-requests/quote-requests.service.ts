import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DeepPartial } from 'typeorm';
import { QuoteRequest } from './entities/quote-request.entity';
import { QuoteRequestService as QrServiceEntity } from './entities/quote-request-service.entity';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { Client } from '../clients/entities/client.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class QuoteRequestsService {
  constructor(
    @InjectRepository(QuoteRequest) private qrRepo: Repository<QuoteRequest>,
    @InjectRepository(QrServiceEntity) private qrsRepo: Repository<QrServiceEntity>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
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
        lenguaNativa: '',
        tipoDocumento: 'QR',
        numeroDocumento: `QR-${Date.now()}`,
        mercado: '',
        rubro: '',
        genero: 'Masculino',
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

    return this.findOne(savedQr.id);
  }

  async findOne(id: number): Promise<QuoteRequest> {
    const qr = await this.qrRepo.findOne({ where: { id }, relations: ['services', 'services.service', 'client'] });
    if (!qr) throw new NotFoundException('QuoteRequest not found');
    return qr;
  }

  async findAll(page = 0, limit = 10) {
    const [data, total] = await this.qrRepo.findAndCount({
      relations: ['client', 'services', 'services.service'],
      skip: page * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return { data, total, page, limit };
  }
}


