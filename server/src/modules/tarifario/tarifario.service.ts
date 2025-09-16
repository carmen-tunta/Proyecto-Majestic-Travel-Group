import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarifario } from './entities/tarifario.entity';

@Injectable()
export class TarifarioService {
    constructor(
        @InjectRepository(Tarifario)
        private tarifarioRepository: Repository<Tarifario>,
    ) { }

    async findAll(): Promise<Tarifario[]> {
        return this.tarifarioRepository.find();
    }

    async create(data: Partial<Tarifario>): Promise<any> {
        const newTarifa = this.tarifarioRepository.create(data);
        const saved = await this.tarifarioRepository.save(newTarifa);
        return {
            ...saved,
            validityFrom: saved.validityFrom
                ? new Date(saved.validityFrom).toISOString().slice(0, 10)
                : null,
            validityTo: saved.validityTo
                ? new Date(saved.validityTo).toISOString().slice(0, 10)
                : null,
        };
    }

    async findById(id: string): Promise<Tarifario | null> {
        return this.tarifarioRepository.findOneBy({ id: Number(id) });
    }

    async update(id: string, data: Partial<Tarifario>): Promise<Tarifario | null> {
        await this.tarifarioRepository.update(id, data);
        return this.findById(id);
    }

    async findByProveedorId(proveedorId: number): Promise<Tarifario[]> {
        return this.tarifarioRepository.find({
            where: { proveedorId },
        });
    }

}
