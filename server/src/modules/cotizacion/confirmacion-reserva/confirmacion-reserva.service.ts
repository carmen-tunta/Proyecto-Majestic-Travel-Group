import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfirmacionReserva } from '../entities/confirmacion-reserva.entity';

@Injectable()
export class ConfirmacionReservaService {
  constructor(
    @InjectRepository(ConfirmacionReserva)
    private confirmacionReservaRepository: Repository<ConfirmacionReserva>,
  ) {}

  async getByCotizacionId(cotizacionId: number): Promise<ConfirmacionReserva | null> {
    return this.confirmacionReservaRepository.findOne({ where: { cotizacionId } });
  }

  async create(data: Partial<ConfirmacionReserva>): Promise<ConfirmacionReserva> {
    const confirmacion = this.confirmacionReservaRepository.create(data);
    return this.confirmacionReservaRepository.save(confirmacion);
  }

  async createOrUpdate(cotizacionId: number, data: Partial<ConfirmacionReserva>): Promise<ConfirmacionReserva | null> {
    const existing = await this.getByCotizacionId(cotizacionId);
    
    if (existing) {
      // Filtrar solo los campos definidos para actualizar
      const filteredData = Object.keys(data).reduce((acc, key) => {
        if (data[key] !== undefined && data[key] !== null) {
          acc[key] = data[key];
        }
        return acc;
      }, {} as any);

      if (Object.keys(filteredData).length > 0) {
        await this.confirmacionReservaRepository.update(existing.id, filteredData);
      }

      return this.confirmacionReservaRepository.findOne({ 
        where: { id: existing.id }
      });
    } else {
      console.log(`Creando nueva confirmación de reserva para cotización ${cotizacionId}`);
      return this.create({ ...data, cotizacionId });
    }
  }

  async update(id: string, data: Partial<ConfirmacionReserva>): Promise<ConfirmacionReserva | null> {
    const numericId = Number(id);
    
    if (!data || Object.keys(data).length === 0) {
      return this.confirmacionReservaRepository.findOne({ 
        where: { id: numericId } 
      });
    }

    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    }, {} as any);

    if (Object.keys(filteredData).length > 0) {
      await this.confirmacionReservaRepository.update(numericId, filteredData);
    }

    return this.confirmacionReservaRepository.findOne({ 
      where: { id: numericId },
    });
  }
}

