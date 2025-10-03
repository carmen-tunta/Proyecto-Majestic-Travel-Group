import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators";
import { Repository } from "typeorm";
import { Portada } from "../entities/portada.entity";

@Injectable()
export class PortadaService {
    constructor(
        @InjectRepository(Portada)
        private portadaRepository: Repository<Portada>
    ) {}

    async getPortadaByServiceId(serviceId: number): Promise<Portada | null> {
        return this.portadaRepository.findOne({ where: { serviceId } });
    }

    async createPortada(data: Partial<Portada>): Promise<Portada> {
        const portada = this.portadaRepository.create(data);
        return this.portadaRepository.save(portada);
    }

    async updatePortada(id: string, data: Partial<Portada>): Promise<Portada | null> {
        await this.portadaRepository.update(id, data);
        return this.portadaRepository.findOne({ where: { id: Number(id) } });
    }
}