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

    async create(data: Partial<Tarifario>): Promise<Tarifario> {
        const newTarifa = this.tarifarioRepository.create(data);
        return this.tarifarioRepository.save(newTarifa);
    }

    async findById(id: string): Promise<Tarifario | null> {
        return this.tarifarioRepository.findOneBy({ id: Number(id) });
    }

    async update(id: string, data: Partial<Tarifario>): Promise<Tarifario | null> {
        await this.tarifarioRepository.update(id, data);
        return this.findById(id);
    }

}
