import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TarifaColumn } from "./entities/tarifaColumn.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class TarifaColumnService { 
    constructor(
        @InjectRepository(TarifaColumn) 
        private tarifaColumnRepository: Repository<TarifaColumn>,
    ) { }
    
    async create(data: Partial<TarifaColumn>): Promise<TarifaColumn> {
        const newTarifaColumn = this.tarifaColumnRepository.create(data);
        return this.tarifaColumnRepository.save(newTarifaColumn);
    }

    async findAll(): Promise<TarifaColumn[]> {
        return this.tarifaColumnRepository.find();
    }

    async findByTarifaId(tarifaId: string): Promise<TarifaColumn[]> {
        return this.tarifaColumnRepository.find({
            where: { tarifa_id: Number(tarifaId) },
        });
    }

    async update(id: string, data: Partial<TarifaColumn>): Promise<TarifaColumn | null> {
        await this.tarifaColumnRepository.update(id, data);
        return this.tarifaColumnRepository.findOneBy({ id: Number(id) });
    }

    async delete(id: string): Promise<{ deleted: boolean }> {
        const result = await this.tarifaColumnRepository.delete(id);
        return { deleted: !!result.affected };
    }
    

}