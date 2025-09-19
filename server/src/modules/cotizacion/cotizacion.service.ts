import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class CotizacionService {
  constructor(
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepository: Repository<Cotizacion>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createCotizacionDto: CreateCotizacionDto): Promise<Cotizacion> {
    const client = await this.clientRepository.findOne({ where: { id: createCotizacionDto.clienteId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    const cotizacion = this.cotizacionRepository.create({
      ...createCotizacionDto,
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
}
