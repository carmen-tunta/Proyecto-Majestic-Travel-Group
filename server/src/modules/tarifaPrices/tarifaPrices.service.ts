import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TarifaPrices } from "./entities/tarifaPrices.entity";
import { Repository } from "typeorm";

@Injectable()
export class TarifaPricesService {
    constructor(
        @InjectRepository(TarifaPrices)
        private tarifaPricesRepository: Repository<TarifaPrices>,
    ) { }

    async create(data: Partial<TarifaPrices>): Promise<TarifaPrices> {
        const newTarifaPrice = this.tarifaPricesRepository.create(data);
        return this.tarifaPricesRepository.save(newTarifaPrice);
    }

    async findAll(): Promise<TarifaPrices[]> {
        return this.tarifaPricesRepository.find();
    }

    async findByComponentColumnId(componentId: number, columnId: number): Promise<TarifaPrices[]> {
        return this.tarifaPricesRepository.find({
            where: { tarifa_component_id: componentId, tarifa_column_id: columnId },
        });
    }

    async findByTarifaId(tarifaId: string): Promise<TarifaPrices[]> {
        return this.tarifaPricesRepository.find({
            where: { component: { tarifa_id: Number(tarifaId) } },
        });
    }

    async update(id: string, data: Partial<TarifaPrices>): Promise<TarifaPrices | null> {
        await this.tarifaPricesRepository.update(id, data);
        return this.tarifaPricesRepository.findOneBy({ id: Number(id) });
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const result = await this.tarifaPricesRepository.delete(id);
        return { deleted: !!result && !!result.affected && result.affected > 0 };
    }

}