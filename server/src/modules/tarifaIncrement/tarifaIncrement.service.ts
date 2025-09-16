import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TarifaIncrement } from "./entities/increment.entity";
import { Repository } from "typeorm";

@Injectable()
export class TarifaIncrementService { 
    constructor(
        @InjectRepository(TarifaIncrement) 
        private incrementRepository: Repository<TarifaIncrement>,
    ) {}

    async create(data: Partial<TarifaIncrement>): Promise<TarifaIncrement> {
        const newIncrement = this.incrementRepository.create(data);
        return this.incrementRepository.save(newIncrement);
    }

    async findByTarifaId(tarifaId: number): Promise<TarifaIncrement[]> {
        return this.incrementRepository.find({
            where: { tarifaId },
        });
    }

    async delete(id: string): Promise<{ deleted: boolean }> {
        const result = await this.incrementRepository.delete(Number(id));
        return { deleted: !!result.affected };
    }

    async update(id: string, data: Partial<TarifaIncrement>): Promise<TarifaIncrement | null> {
        await this.incrementRepository.update(Number(id), data);
        return this.incrementRepository.findOneBy({ id: Number(id) });
    }

}