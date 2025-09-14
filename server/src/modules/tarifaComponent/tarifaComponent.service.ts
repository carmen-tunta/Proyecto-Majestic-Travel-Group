import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TarifaComponent } from "./entities/tarifaComponent.entity";
import { Repository } from "typeorm";

@Injectable()
export class TarifaComponentService {
    constructor(
        @InjectRepository(TarifaComponent)
        private tarifaComponentRepository: Repository<TarifaComponent>,
    ) { }

    async create(data: Partial<TarifaComponent>): Promise<TarifaComponent> {
        const newTarifaComponent = this.tarifaComponentRepository.create(data);
        return this.tarifaComponentRepository.save(newTarifaComponent);
    }

    async findAll(): Promise<TarifaComponent[]> {
        return this.tarifaComponentRepository.find();
    }

    async findById(id: string): Promise<TarifaComponent | null> {
        return this.tarifaComponentRepository.findOneBy({ id: Number(id) });
    }

    async update(id: string, data: Partial<TarifaComponent>): Promise<TarifaComponent | null> {
        await this.tarifaComponentRepository.update(id, data);
        return this.findById(id);
    }

    async findByTarifaId(tarifaId: number): Promise<TarifaComponent[]> {
        return this.tarifaComponentRepository.find({
            where: { tarifa_id: tarifaId },
        });
    }

    async remove(tarifaId: string, componentId: string): Promise<{ deleted: boolean }> {
        const result = await this.tarifaComponentRepository.delete({
            tarifa_id: Number(tarifaId),
            componente_id: Number(componentId)
        });
        return { deleted: !!result && !!result.affected && result.affected > 0 };
    }
}
