import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedores } from './entities/proveedores.entity';


@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedores)
    private proveedoresRepository: Repository<Proveedores>
  ) { }

    async create(data: Partial<Proveedores>): Promise<Proveedores> {
      const newProveedor = this.proveedoresRepository.create(data);
      return this.proveedoresRepository.save(newProveedor);
    }

    async findAll(): Promise<Proveedores[]> {
      return this.proveedoresRepository.find();
    }

    async findById(id: string): Promise<Proveedores | null> {
      return this.proveedoresRepository.findOne({ where: { id: parseInt(id, 10) } });
    }

    async update(id: string, data: Partial<Proveedores>): Promise<Proveedores | null> {
      const proveedor = await this.proveedoresRepository.findOne({ where: { id: parseInt(id, 10) } });
        if (!proveedor) {   
            return null;
        }
        Object.assign(proveedor, data);
        return this.proveedoresRepository.save(proveedor);
    }
}