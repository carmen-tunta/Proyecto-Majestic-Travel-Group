import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorContact } from './entities/proveedor-contact.entity';

@Injectable()
export class ProveedorContactService {
  constructor(
    @InjectRepository(ProveedorContact)
    private proveedoresRepository: Repository<ProveedorContact>
  ) { }

    async create(data: Partial<ProveedorContact>): Promise<ProveedorContact> {
        if (data.proveedor && typeof (data.proveedor as any).id !== 'number') {
            throw new BadRequestException(`El proveedor.id no es válido: ${JSON.stringify(data.proveedor)}`);
        }

        const newProveedorContact = this.proveedoresRepository.create(data);
        return this.proveedoresRepository.save(newProveedorContact);
    }

    async findById(id: string): Promise<ProveedorContact | null> {
        const parsedId = Number(id);
        if (isNaN(parsedId)) {
        throw new BadRequestException(`El id "${id}" no es válido`);
        }

        return this.proveedoresRepository.findOne({
        where: { id: parsedId },
        relations: ['proveedor'],
        });
    }

    async findByProveedorId(proveedorId: number): Promise<ProveedorContact[]> {
        return this.proveedoresRepository.find({
            where: { proveedorId },
            relations: ['proveedor'],
        });
    }

    async update(id: string, data: Partial<ProveedorContact>): Promise<ProveedorContact | null> {
        const parsedId = Number(id);
        if (isNaN(parsedId)) {
        throw new BadRequestException(`El id "${id}" no es válido`);
        }

        const proveedorContact = await this.proveedoresRepository.findOne({
        where: { id: parsedId },
        });
        if (!proveedorContact) {
        return null;
        }
        this.proveedoresRepository.merge(proveedorContact, data);
        return this.proveedoresRepository.save(proveedorContact);
    }

    async delete(id: string): Promise<boolean> {
        const parsedId = Number(id);
        if (isNaN(parsedId)) {
        throw new BadRequestException(`El id "${id}" no es válido`);
        }

        const result = await this.proveedoresRepository.delete(parsedId);
        return (result.affected ?? 0) > 0;
    }
}