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

    async deleteColumnByDescription(tarifaId: number, description: string, paxMin: string, paxMax: string) {
        // 1. Buscar los TarifaColumn que cumplen el filtro
        const columns = await this.tarifaColumnRepository.find({
            where: {
                description,
                paxMin: Number(paxMin),
                paxMax: Number(paxMax),
                tarifa_id: tarifaId
            },
            relations: ['tarifa']
        });
        // 2. Eliminar por los IDs encontrados
        const ids = columns.map(col => col.id);
        if (ids.length === 0) return { affected: 0 };
        return this.tarifaColumnRepository.delete({ id: In(ids) });
    }
    

}